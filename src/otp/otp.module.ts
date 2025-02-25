import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OTPSchema } from './schema/otp.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from 'src/user/schema/user.model';
import { MailgunModule } from 'nestjs-mailgun';
import { MailgunProvider } from '@common/services/email-service';

@Module({
  imports: [
    ConfigModule,
    MailgunModule.forAsyncRoot({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          username: 'api',
          key: configService.get<string>('MAILGUN_API_KEY') ?? '',
        };
      },
    }),
    MailerModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: OTP.name, schema: OTPSchema },
    ]),
  ],
  controllers: [OtpController],
  providers: [OtpService, MailgunProvider],
})
export class OtpModule {}
