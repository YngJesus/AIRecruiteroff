import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewQuestionsDto } from './dto/update-review-questions.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';

@ApiBearerAuth()
@ApiTags('Reviews')
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.createAndNotify(dto, user);
  }

  @Get('techlead/:id/prep')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  findInterviewPrep(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.findInterviewPrepByTechLead(id, user);
  }

  @Get('techlead/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  findByTechLead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.findByTechLead(id, user);
  }

  @Patch(':id/questions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  updateQuestions(
    @Param('id') id: string,
    @Body() dto: UpdateReviewQuestionsDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.updateQuestions(id, dto.questions, user);
  }

  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  accept(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.accept(id, user);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  reject(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.reject(id, user);
  }
}
