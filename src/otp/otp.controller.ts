import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ResponseMessage } from '@common/decorators/response.message';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @ResponseMessage('OTP sent successfully!')
  async sendOtp(@Body() body: { email: string }) {
    return this.otpService.sendOtp(body.email);
  }

  @Post('verify')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return await this.otpService.verifyOtp(body.email, body.otp);
  }
}
