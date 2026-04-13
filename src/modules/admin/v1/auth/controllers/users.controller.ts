import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/modules/users/users/v1/services/users.service';
import { AdminService } from '../service/admin.service';
import { JwtAuthGuard } from 'src/modules/users/auth/v1/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/decorators/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../enum/role.enum';
import { CreateUserDto } from 'src/modules/users/users/v1/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/users/v1/dto/update-user.dto';
import { BanUserDto } from '../dto/ban-user.dto';

@Controller({
  path: 'admin/users',
  version: '1',
})
@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminService: AdminService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create user profile (admin only)' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by id (admin only)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile by id (admin only)' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user profile by id (admin only)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/ban')
  @ApiOperation({ summary: 'Ban user account with reason details (admin only)' })
  @ApiBody({ type: BanUserDto })
  banUser(@Param('id') id: string, @Body() dto: BanUserDto) {
    return this.adminService.banUser(id, dto);
  }

  @Patch(':id/unban')
  @ApiOperation({ summary: 'Unban user account (admin only)' })
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }
}
