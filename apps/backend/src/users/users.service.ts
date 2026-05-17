import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      email: createUserDto.email,
      password: hashed,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role,
      departmentId: createUserDto.departmentId,
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async adminRemove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
  }
}
