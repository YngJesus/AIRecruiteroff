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
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('Availability')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Roles(UserRole.TECH_LEAD, UserRole.RECRUITER, UserRole.ADMIN)
  @Get(':userId')
  async findForUser(@Param('userId') userId: string) {
    return this.availabilityService.findAllForUser(userId);
  }

  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.create(dto);
  }

  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAvailabilityDto) {
    return this.availabilityService.update(id, dto);
  }

  @Roles(UserRole.TECH_LEAD, UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.availabilityService.remove(id);
  }
}
