import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private repo: Repository<Notification>,
  ) {}

  create(dto: CreateNotificationDto) {
    const n = this.repo.create(dto as any);
    return this.repo.save(n);
  }

  findForUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async markRead(id: string) {
    const n = await this.repo.findOne({ where: { id } });
    if (!n) return null;
    n.read = true;
    return this.repo.save(n);
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, read: false }, { read: true });
    return this.findForUser(userId);
  }
}
