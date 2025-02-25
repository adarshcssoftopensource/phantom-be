import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Mailgun from 'mailgun.js';

@Injectable()
export class MailgunProvider {
  private mailgun;
  private readonly apiKey: string;
  private readonly domain: string;
  private readonly fromEmail: string;
  constructor(private configService: ConfigService) {
    const mailgun = new Mailgun(FormData);
    this.apiKey = configService.get<string>('MAILGUN_API_KEY')!;
    this.domain = configService.get<string>('MAILGUN_DOMAIN')!;
    this.fromEmail = configService.get<string>('EMAIL_USER')!;
    this.mailgun = mailgun.client({ username: 'api', key: this.apiKey });
  }
  async sendEmail(to: string, subject: string, content: string): Promise<any> {
    try {
      const response = await this.mailgun.messages.create('mailer.payyit.com', {
        from: 'postmaster@mailer.payyit.com',
        to,
        subject,
        html: content,
      });

      console.log(response);

      return {
        success: true,
        messageId: response.id,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        error: error.message,
      };
    }
  }
}
