import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability) private repo: Repository<Availability>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({ where: { userId } });
  }

  async findById(id: string) {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Availability not found');
    return a;
  }

  create(dto: CreateAvailabilityDto) {
    const a = this.repo.create(dto);
    return this.repo.save(a);
  }

  async update(id: string, dto: UpdateAvailabilityDto) {
    const a = await this.findById(id);
    Object.assign(a, dto);
    return this.repo.save(a);
  }

  async remove(id: string) {
    const a = await this.findById(id);
    return this.repo.remove(a);
  }
}
