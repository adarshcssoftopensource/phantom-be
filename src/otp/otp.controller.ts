import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ResponseMessage } from '@common/decorators/response.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('otp')
@Public()
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @ResponseMessage('OTP sent successfully!')
  async sendOtp(@Body() body: { email: string; phoneNumber: string }) {
    return this.otpService.sendOtp(body.email, body.phoneNumber);
  }

  @Post('verify')
  async verifyOtp(
    @Body() body: { email: string; phoneNumber: string; otp: string },
  ) {
    return await this.otpService.verifyOtp(
      body.otp,
      body.phoneNumber,
      body.email,
    );
  }
}
