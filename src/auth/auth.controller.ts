import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpCode,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, CreateLoginDto } from './dto/create-auth.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResponseMessage } from 'src/common/decorators/response.message';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @ResponseMessage('User registered successfully')
  @Post('signup')
  async signUp(@Body() signUpDto: CreateAuthDto) {
    return this.authService.signUp(signUpDto);
  }

  @ResponseMessage('User logged in successfully')
  @HttpCode(200)
  @Post('login')
  async login(@Body() loginDto: CreateLoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return this.authService.profiles(req.user.id);
  }

  @HttpCode(200)
  @Get('users')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @ResponseMessage('User updated successfully')
  @HttpCode(200)
  @Put('update/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateAuthDto: UpdateAuthDto,
  ) {
    return this.authService.updateUser(userId, updateAuthDto);
  }

  @ResponseMessage('User deleted successfully')
  @HttpCode(200)
  @Delete('delete/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.authService.deleteUser(userId);
  }



}
