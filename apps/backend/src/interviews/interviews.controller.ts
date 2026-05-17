import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole, User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Roles(UserRole.RECRUITER, UserRole.TECH_LEAD, UserRole.ADMIN)
  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.interviewsService.findAll(user);
  }

  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(dto);
  }

  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  @Get('techlead/:techLeadId')
  async findByTechLead(@Param('techLeadId') techLeadId: string) {
    return this.interviewsService.findByTechLeadId(techLeadId);
  }

  @Roles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.TECH_LEAD)
  @Get('candidate/:candidateId')
  async findByCandidate(@Param('candidateId') candidateId: string) {
    const interview =
      await this.interviewsService.findByCandidateId(candidateId);
    return interview ?? null;
  }

  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @Patch(':id/reschedule')
  async reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleInterviewDto,
  ) {
    return this.interviewsService.reschedule(id, dto);
  }

  @Roles(UserRole.TECH_LEAD, UserRole.RECRUITER, UserRole.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    return this.interviewsService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.interviewsService.remove(id);
  }
}
