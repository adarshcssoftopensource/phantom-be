import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OTPSchema } from './schema/otp.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: OTP.name, schema: OTPSchema }])],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
