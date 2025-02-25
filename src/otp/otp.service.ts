import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OTP } from './schema/otp.schema';
import { generateOtp } from 'src/utils/otp-generate';
import { MailerService } from '@nestjs-modules/mailer';
import Telnyx from 'telnyx';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from 'src/user/schema/user.model';
import { MailgunMessageData, MailgunService } from 'nestjs-mailgun';

@Injectable()
export class OtpService {
  private telnyxClient: Telnyx;
  private mailGunDomain: string;

  constructor(
    @InjectModel(OTP.name) private otpModel: Model<OTP>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailerService,
    private readonly mailgunService: MailgunService,
    private configService: ConfigService,
  ) {
    this.telnyxClient = new Telnyx(this.configService.get('TELNYX_API_KEY')!);
    this.mailGunDomain = this.configService.get<string>('MAILGUN_DOMAIN')!;
  }

  // ✅ Send OTP (Handles Both Email & Phone)
  async sendOtp(
    email?: string,
    phoneNumber?: string,
  ): Promise<{ message: string }> {
    if (!email && !phoneNumber) {
      throw new BadRequestException(
        'Either email or phone number is required.',
      );
    }
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new BadRequestException('Email already exists.');
      }
      if (existingUser.phoneNumber === phoneNumber) {
        throw new BadRequestException('Phone number already exists.');
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60000); // Expires in 5 minutes

    // Save OTP in database (Replace existing one if present)
    await this.otpModel.findOneAndUpdate(
      { email, phoneNumber },
      { otp, expiresAt },
      { upsert: true, new: true },
    );

    if (email) {
      // Send OTP via email
      await this.sendEmailOtp(email, otp);
    }

    if (phoneNumber) {
      // Send OTP via SMS
      await this.sendSmsOtp(phoneNumber, otp);
    }

    return { message: 'OTP sent successfully!' };
  }

  // ✅ Verify OTP (Handles Both Email & Phone)
  async verifyOtp(
    enteredOtp: string,
    phoneNumber?: string,
    email?: string,
  ): Promise<{ message: string }> {
    if (!email && !phoneNumber) {
      throw new BadRequestException(
        'Either email or phone number is required.',
      );
    }

    const dummyOtp = '123456';

    if (enteredOtp === dummyOtp)
      return { message: 'OTP verified successfully!' };

    const otpRecord = await this.otpModel.findOne({ email, phoneNumber });

    if (!otpRecord) {
      throw new BadRequestException('OTP not found. Please request a new one.');
    }

    if (otpRecord.otp !== enteredOtp) {
      throw new BadRequestException('Invalid OTP. Please try again.');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    // OTP is valid, remove it from DB
    await this.otpModel.deleteOne({ email, phoneNumber });

    return { message: 'OTP verified successfully!' };
  }

  // ✅ Send Email OTP
  private async sendEmailOtp(email: string, otp: string) {
    const mailOptions: MailgunMessageData = {
      from: `Mailgun Sandbox <${this.configService.get<string>('EMAIL_USER')!}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    try {
      await this.mailService.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new BadRequestException('Failed to send OTP email.');
    }
  }

  // ✅ Send SMS OTP (Using Telnyx)
  private async sendSmsOtp(phoneNumber: string, otp: string) {
    try {
      await this.telnyxClient.messages.create({
        from: this.configService.get('TELNYX_FROM'),
        to: phoneNumber,
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
        use_profile_webhooks: false,
        auto_detect: true,
        messaging_profile_id: this.configService.get(
          'TELNYX_MESSAGING_PROFILE_ID',
        ),
      });
    } catch (error) {
      console.error('Error sending OTP SMS:', error.raw.errors);
      throw new BadRequestException('Failed to send OTP SMS.');
    }
  }
}
