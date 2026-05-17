import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private repo: Repository<Department>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findById(id: string) {
    const dep = await this.repo.findOne({ where: { id } });
    if (!dep) throw new NotFoundException('Department not found');
    return dep;
  }

  create(dto: CreateDepartmentDto) {
    const d = this.repo.create(dto);
    return this.repo.save(d);
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const dep = await this.findById(id);
    Object.assign(dep, dto);
    return this.repo.save(dep);
  }

  async remove(id: string) {
    const dep = await this.findById(id);
    return this.repo.remove(dep);
  }
}
