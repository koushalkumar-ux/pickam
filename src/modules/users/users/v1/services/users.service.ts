import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UserRepository } from '../repositories/user.repository';
import { UpdateProfileDto } from '../dto/profile.dto';
import { RedisService } from 'src/infrastructure/redis/service/redis.service';
import { IUserProfile } from '../interfaces/user.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET')!;
  }

  /**
   * Generates a temporary signed URL for viewing private S3 objects
   */
  private async getPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    // URL expires in 1 hour (3600 seconds)
    return getSignedUrl(this.s3Client, command, { expiresIn: 60 });
  }

  private async mapToProfile(user: any): Promise<IUserProfile> {
    const profilePic = user.profilePic ? await this.getPresignedUrl(user.profilePic) : null;

    return {
      id: user._id?.toString() || user.id,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      phoneCode: user.phoneCode,
      gender: user.gender,
      dob: user.dob,
      profilePic: profilePic,
      isVerified: user.isVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findOne(id: string): Promise<IUserProfile> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.mapToProfile(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<IUserProfile> {
    const updatedUser = await this.userRepository.update(id, dto);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Clear cache to ensure updated data is fetched on next request
    await this.redisService.del(`user:email:${updatedUser.email}`);

    return await this.mapToProfile(updatedUser);
  }

  async updateProfilePic(id: string, file: Express.Multer.File): Promise<IUserProfile> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileKey = `profiles/${id}/${Date.now()}-${file.originalname}`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await this.s3Client.send(uploadCommand);

    // Store only the Key in the database, not the full URL
    const updatedUser = await this.userRepository.update(id, { profilePic: fileKey });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    await this.redisService.del(`user:email:${updatedUser.email}`);
    return await this.mapToProfile(updatedUser);
  }
}
