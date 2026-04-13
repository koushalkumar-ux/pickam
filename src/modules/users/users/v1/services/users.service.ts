import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    return this.sanitizeUser(user);
  }

  async findAll() {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async findMyProfile(userId: string) {
    return this.findOne(userId);
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new BadRequestException('Email is already used by another account');
      }
    }

    const payload = { ...dto } as UpdateUserDto;
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const user = await this.userRepository.update(id, payload);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async remove(id: string) {
    const user = await this.userRepository.delete(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  private sanitizeUser(user: any) {
    if (!user) {
      return user;
    }

    const data = typeof user.toObject === 'function' ? user.toObject() : user;
    const { password, otp, otpExpires, ...safeUser } = data;
    return safeUser;
  }
}
