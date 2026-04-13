import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  private readonly PASSWORD_HISTORY_MONTHS = 3;
  private readonly PASSWORD_HISTORY_LIMIT = 2;

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

  async changePassword(id: string, dto: ChangePasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('Password change is not available for this account');
    }

    const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const isSameAsOld = await bcrypt.compare(dto.password, user.password);
    if (isSameAsOld) {
      throw new BadRequestException('New password must be different from old password');
    }

    const recentHistory = (user.passwordHistory || [])
      .filter((entry: any) => {
        if (!entry?.changedAt || !entry?.password) {
          return false;
        }
        const changedAt = new Date(entry.changedAt);
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - this.PASSWORD_HISTORY_MONTHS);
        return changedAt >= cutoff;
      })
      .sort((a: any, b: any) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, this.PASSWORD_HISTORY_LIMIT);

    for (const historyEntry of recentHistory) {
      const isReused = await bcrypt.compare(dto.password, historyEntry.password);
      if (isReused) {
        throw new BadRequestException(
          'New password cannot match your last 2 passwords from the past 3 months',
        );
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const updated = await this.userRepository.update(id, {
      password: hashedPassword,
      passwordHistory: [
        {
          password: user.password,
          changedAt: new Date(),
        },
        ...(user.passwordHistory || []),
      ].slice(0, this.PASSWORD_HISTORY_LIMIT),
    });
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Password updated successfully' };
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
    const { password, passwordHistory, otp, otpExpires, ...safeUser } = data;
    return safeUser;
  }
}
