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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('Questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async findAll() {
    return this.questionsService.findAll();
  }

  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto);
  }

  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionsService.update(id, dto);
  }

  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
