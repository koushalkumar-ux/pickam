import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { 
  User, UserSchema, 
  StaffProfile, StaffProfileSchema, 
  BuyerProfile, BuyerProfileSchema, 
  ShopmateProfile, ShopmateProfileSchema 
} from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: StaffProfile.name, schema: StaffProfileSchema },
      { name: BuyerProfile.name, schema: BuyerProfileSchema },
      { name: ShopmateProfile.name, schema: ShopmateProfileSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}