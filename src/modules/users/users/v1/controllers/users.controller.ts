import { Controller, Get, Patch, UseInterceptors, UploadedFile, UseGuards, Body } from '@nestjs/common';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../../auth/v1/guards/jwt-auth.guard';
import { User } from '../../../../../common/decorators/user.decorator';
import { UpdateProfileDto } from '../dto/profile.dto';
import { IUserProfile } from '../interfaces/user.interface';

@UseGuards(JwtAuthGuard)
@Controller({
    path: 'users',
    version: '1',
})
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    getProfile(@User() user: any): Promise<IUserProfile> {
        // The user ID is extracted from the JWT payload (sub)
        return this.usersService.findOne(user.sub);
    }

    @Patch('profile')
    updateProfile(@User() user: any, @Body() dto: UpdateProfileDto): Promise<IUserProfile> {
        // Pass the user ID and the update data to the service
        return this.usersService.updateProfile(user.sub, dto);
    }

    @Patch('profile/picture')
    @UseInterceptors(FileInterceptor('file'))
    updateProfilePic(
        @User() user: any,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<IUserProfile> {
        return this.usersService.updateProfilePic(user.sub, file);
    }
}
