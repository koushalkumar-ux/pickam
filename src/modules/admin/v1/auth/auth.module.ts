import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminService } from './service/admin.service';
import { AdminAuthController } from './controllers/auth.controller';
import { AdminUsersController } from './controllers/users.controller';
import { AdminRepository } from '../auth/repositories/admin.repository';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { UsersModule } from '../../../users/users/v1/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AdminAuthController, AdminUsersController],
  providers: [AdminService, AdminRepository],
  exports: [AdminService, AdminRepository],
})
export class AdminAuthModule {}