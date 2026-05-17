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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { UpdateCandidateStatusDto } from './dto/update-candidate-status.dto';
import { UploadService } from 'src/upload/upload.service';
import { JobsService } from 'src/jobs/jobs.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@ApiBearerAuth()
@ApiTags('Candidates')
@UseGuards(JwtAuthGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly uploadService: UploadService,
    private readonly jobsService: JobsService,
    @InjectQueue('cv-processing') private readonly cvQueue: Queue,
  ) {}
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: 201, description: 'Candidate created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidatesService.create(createCandidateDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.TECH_LEAD)
  @ApiOperation({ summary: 'Get all candidates (filter by jobId optional)' })
  @ApiResponse({ status: 200, description: 'List of candidates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: any, @Query('jobId') jobId?: string) {
    return this.candidatesService.findAll(user, jobId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.TECH_LEAD)
  @ApiOperation({ summary: 'Get a specific candidate' })
  @ApiResponse({ status: 200, description: 'Candidate details' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.candidatesService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
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
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
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
  @ApiOperation({ summary: 'Upload CV file and enqueue analysis' })
  @ApiResponse({ status: 201, description: 'Candidate queued for processing' })
  @ApiResponse({ status: 400, description: 'Invalid file or jobId' })
  @ApiResponse({ status: 413, description: 'File too large' })
  async uploadCVAndCreateCandidate(
    @Query('jobId') jobId: string,
    @UploadedFile() file: any,
    @CurrentUser() user: any,
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

    try {
      await this.jobsService.findOne(jobId, user);
    } catch (err) {
      throw new BadRequestException('Job not found or not in your department');
    }

    // Save file
    const filepath = await this.uploadService.handleFileUpload(file);

    // Create candidate
    const candidate = await this.candidatesService.create({
      jobId,
      cvFileName: file.originalname,
      cvFilePath: filepath,
    } as any);

    await this.cvQueue.add('analyze-cv', {
      candidateId: candidate.id,
      filepath,
      mimetype: file.mimetype,
      jobId,
    });

    return {
      candidateId: candidate.id,
      status: 'queued',
    };
  }

  @Get(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.TECH_LEAD)
  @ApiOperation({ summary: 'Get candidate processing status' })
  @ApiResponse({ status: 200, description: 'Current candidate status' })
  async getStatus(@Param('id') id: string, @CurrentUser() user: any) {
    const candidate = await this.candidatesService.findOne(id, user);
    return {
      id: candidate.id,
      status: candidate.status,
      processingError: candidate.processingError ?? null,
      updatedAt: candidate.updatedAt,
    };
  }

  @Get(':id/cv')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.TECH_LEAD)
  @ApiOperation({ summary: 'Download decrypted CV file' })
  @ApiResponse({ status: 200, description: 'CV file stream' })
  async downloadCV(@Param('id') id: string, @Res() res: Response) {
    const candidate = await this.candidatesService.findOne(id);
    const stream = this.uploadService.getDecryptedStream(candidate.cvFilePath);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${candidate.cvFileName}"`,
    );
    res.setHeader('Content-Type', 'application/octet-stream');
    stream.pipe(res);
  }
}
