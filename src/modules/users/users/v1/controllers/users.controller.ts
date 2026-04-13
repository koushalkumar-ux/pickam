import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { JwtAuthGuard } from '../../../auth/v1/guards/jwt-auth.guard';
import { User } from '../../../../../common/decorators/user.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller({
  path: 'users',
  version: '1',
})
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  findMyProfile(@User() user: any) {
    return this.usersService.findMyProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  updateMyProfile(@User() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @ApiBody({ type: ChangePasswordDto })
  changeMyPassword(@User() user: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user profile' })
  removeMyProfile(@User() user: any) {
    return this.usersService.remove(user.sub);
  }

}
