import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, StaffProfile, BuyerProfile, ShopmateProfile } from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(StaffProfile.name) private staffModel: Model<StaffProfile>,
    @InjectModel(BuyerProfile.name) private buyerModel: Model<BuyerProfile>,
    @InjectModel(ShopmateProfile.name) private shopmateModel: Model<ShopmateProfile>,
  ) {}

  async create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).lean();
  }

  async findById(id: string) {
    return this.userModel.findById(id).lean();
  }

  async update(id: string, data: any) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async createStaffProfile(userId: string) {
    return this.staffModel.create({ userId });
  }

  async createBuyerProfile(userId: string) {
    return this.buyerModel.create({ userId });
  }

  async createShopmateProfile(userId: string) {
    return this.shopmateModel.create({ userId });
  }
}