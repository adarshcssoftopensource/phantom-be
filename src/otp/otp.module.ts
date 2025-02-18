import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OTPSchema } from './schema/otp.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from 'src/user/schema/user.model';

@Module({
  imports: [
    ConfigModule,
    MailerModule,
    MongooseModule.forFeature([{ name: OTP.name, schema: OTPSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
