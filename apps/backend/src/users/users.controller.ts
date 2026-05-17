import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { User, UserRole } from './entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private sanitize(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user as any;
    return safe;
  }

  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((u) => this.sanitize(u));
  }
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.sanitize(user);
  }

  @Roles(UserRole.ADMIN)
  @Get('by-email/:email')
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return this.sanitize(user);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return this.sanitize(user);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async adminUpdate(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    const user = await this.usersService.adminUpdate(id, dto);
    return this.sanitize(user);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async adminRemove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    if (currentUser?.id === id) {
      throw new BadRequestException('You cannot delete your own account');
    }
    await this.usersService.adminRemove(id);
    return { ok: true };
  }
}
