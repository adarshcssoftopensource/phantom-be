import {
  Controller,
  Get,
  UseGuards,
  Req,
  HttpCode,
  Put,
  Param,
  Body,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ResponseMessage } from '@common/decorators/response.message';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(200)
  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getAllUsers(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      search,
    );
  }

  @Get('user/:id')
  async getById(@Param('id') userId: string) {
    return this.userService.getUserById(userId);
  }

  @ResponseMessage('User updated successfully')
  @HttpCode(200)
  @Put(':id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateAuthDto: Partial<UpdateUserDto>,
  ) {
    return this.userService.updateUser(userId, updateAuthDto);
  }

  @ResponseMessage('User deleted successfully')
  @HttpCode(200)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId);
  }

  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.profile(req.user.id);
  }
}
