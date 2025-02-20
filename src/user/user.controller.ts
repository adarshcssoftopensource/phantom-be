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
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseMessage } from '@common/decorators/response.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(200)
  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.userService.getAllUsers(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      search,
      sortField,
      sortOrder,
    );
  }

  @HttpCode(200)
  @Get('sub-users')
  async getSubUsers(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const userId = req.user.id;
    return this.userService.getAllSubUsers(
      userId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      search,
      sortField,
      sortOrder,
    );
  }

  @Get('user/:id')
  async getById(@Param('id') userId: string) {
    return this.userService.getUserById(userId);
  }

  @HttpCode(201)
  @Post('sub-user')
  async addUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
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
