import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  userId: string;
  type: NotificationType;
  payload?: any;
}
