import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(@InjectRepository(Question) private repo: Repository<Question>) {}

  findAll() {
    return this.repo.find();
  }

  async findById(id: string) {
    const q = await this.repo.findOne({ where: { id } });
    if (!q) throw new NotFoundException('Question not found');
    return q;
  }

  create(dto: CreateQuestionDto) {
    const q = this.repo.create(dto);
    return this.repo.save(q);
  }

  async update(id: string, dto: UpdateQuestionDto) {
    const q = await this.findById(id);
    Object.assign(q, dto);
    return this.repo.save(q);
  }

  async remove(id: string) {
    const q = await this.findById(id);
    return this.repo.remove(q);
  }
}
