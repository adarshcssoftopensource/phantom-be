import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { generateOtp } from 'src/utils/otp-generate';
import { OTP } from './schema/otp.schema';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(OTP.name) private otpModel: Model<OTP>,
    private readonly mailService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendOtp(email: string): Promise<{ message: string }> {
    const otp = generateOtp();

    // Store OTP in the database with expiration
    await this.otpModel.findOneAndUpdate(
      { email },
      { otp, expiresAt: new Date(Date.now() + 5 * 60000) }, // Expiry: 5 minutes
      { upsert: true, new: true },
    );

    // Send OTP via email
    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    try {
      await this.mailService.sendMail(mailOptions);
      return { message: 'OTP sent successfully!' };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new BadRequestException('Failed to send OTP email.');
    }
  }

  async verifyOtp(
    email: string,
    enteredOtp: string,
  ): Promise<{ message: string; success: boolean }> {
    const otpRecord = await this.otpModel.findOne({ email });

    if (!otpRecord) {
      throw new BadRequestException('OTP not found. Please request a new one.');
    }

    if (otpRecord.otp !== enteredOtp) {
      throw new BadRequestException('Invalid OTP. Please try again.');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    // If OTP is valid, remove it from DB
    await this.otpModel.deleteOne({ email });

    return { success: true, message: 'OTP verified successfully!' };
  }
}
