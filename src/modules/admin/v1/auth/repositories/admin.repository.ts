import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../schemas/admin.schema';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
  ) {}

  async create(data: Partial<Admin>): Promise<AdminDocument> {
    return this.adminModel.create(data);
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ email });
  }

  async findById(id: string): Promise<AdminDocument | null> {
    return this.adminModel.findById(id);
  }

  async findAll(): Promise<Admin[]> {
    return this.adminModel.find().select('-password').lean();
  }

  async findByIdAndUpdate(id: string, updateData: any): Promise<AdminDocument | null> {
    return this.adminModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findByIdAndDelete(id: string): Promise<AdminDocument | null> {
    return this.adminModel.findByIdAndDelete(id);
  }

  async save(admin: AdminDocument): Promise<AdminDocument> {
    return admin.save();
  }
}