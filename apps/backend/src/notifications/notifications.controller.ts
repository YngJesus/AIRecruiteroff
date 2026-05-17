import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Notifications')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.svc.create(dto);
  }

  @Get('me')
  findMine(@Request() req: any) {
    const user = req.user;
    return this.svc.findForUser(user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.svc.markRead(id);
  }

  @Patch('me/mark-all-read')
  markAllRead(@Request() req: any) {
    return this.svc.markAllRead(req.user.id);
  }
}
