import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Query,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { UpdateCandidateStatusDto } from './dto/update-candidate-status.dto';
import { UploadService } from 'src/upload/upload.service';
import { ParserService } from './parser.service';
import { JobsService } from 'src/jobs/jobs.service';

@ApiBearerAuth()
@ApiTags('Candidates')
@UseGuards(JwtAuthGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly uploadService: UploadService,
    private readonly parserService: ParserService,
    private readonly jobsService: JobsService,
  ) {}
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: 201, description: 'Candidate created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidatesService.create(createCandidateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all candidates (filter by jobId optional)' })
  @ApiResponse({ status: 200, description: 'List of candidates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('jobId') jobId?: string) {
    return this.candidatesService.findAll(jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific candidate' })
  @ApiResponse({ status: 200, description: 'Candidate details' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update candidate' })
  @ApiResponse({ status: 200, description: 'Candidate updated' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Update candidate status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCandidateStatusDto,
  ) {
    return this.candidatesService.updateStatus(
      id,
      updateStatusDto.status as any,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Delete candidate' })
  @ApiResponse({ status: 200, description: 'Candidate deleted' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF or image file',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload CV file, create candidate, and parse' })
  @ApiResponse({ status: 201, description: 'Candidate created' })
  @ApiResponse({ status: 400, description: 'Invalid file or jobId' })
  @ApiResponse({ status: 413, description: 'File too large' })
  async uploadCVAndCreateCandidate(
    @Query('jobId') jobId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!jobId) {
      throw new BadRequestException('jobId query param required');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File too large (max 10MB)');
    }

    // Validate job exists
    try {
      // Assuming you have access to JobsService - add to constructor
      await this.jobsService.findOne(jobId);
    } catch (err) {
      throw new BadRequestException('Job not found');
    }

    // Save file
    const filepath = await this.uploadService.handleFileUpload(file);

    // Extract text
    let rawText = '';
    if (file.mimetype === 'application/pdf') {
      rawText = await this.uploadService.extractTextFromPDF(filepath);
    } else {
      rawText = await this.uploadService.extractTextFromImage(filepath);
    }

    // Parse CV
    const parsedData = this.parserService.parseCV(rawText);

    // Create candidate
    const candidate = await this.candidatesService.create({
      jobId,
      cvFileName: file.originalname,
      cvFilePath: filepath,
    } as any);

    // Update with parsed data
    const updated = await this.candidatesService.updateParsedData(
      candidate.id,
      parsedData,
    );

    return updated;
  }
}
