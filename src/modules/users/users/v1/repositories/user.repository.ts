import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).lean();
  }

  async findById(id: string) {
    return this.userModel.findById(id).lean();
  }

  async findAll() {
    return this.userModel.find().lean();
  }

  async update(id: string, data: any) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id).lean();
  }
}