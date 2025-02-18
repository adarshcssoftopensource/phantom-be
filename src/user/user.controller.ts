import {
  Controller,
  Get,
  Req,
  HttpCode,
  Put,
  Param,
  Body,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseMessage } from '@common/decorators/response.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { ROLE } from './user.role.enum';

@Controller('user')
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
  @Roles([ROLE.Admin, ROLE.Developer])
  getProfile(@Req() req) {
    return this.userService.profile(req.user.id);
  }
}
