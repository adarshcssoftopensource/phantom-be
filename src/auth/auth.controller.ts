import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, CreateLoginDto } from './dto/create-auth.dto';
import { ResponseMessage } from 'src/common/decorators/response.message';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
}
