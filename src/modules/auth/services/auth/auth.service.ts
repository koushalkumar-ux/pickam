import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../users/repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async register(dto: any) {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
    });
    return this.generateToken(user);
  }

  async login(dto: any) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  generateToken(user: any) {
    const payload = { sub: user._id || user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}