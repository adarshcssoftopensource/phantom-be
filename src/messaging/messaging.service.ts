import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Telnyx from 'telnyx';

@Injectable()
export class MessagingService {
  private telnyxClient;

  constructor(private configService: ConfigService) {
    this.telnyxClient = new Telnyx(
      this.configService.get<string>('TELNYX_API_KEY') ?? '',
    );
  }

  async sendMessage(to: string, message: string) {
    try {
      const response = await fetch('https://api.telnyx.com/v2/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.configService.get<string>('TELNYX_API_KEY')}`,
        },
        body: JSON.stringify({
          from: this.configService.get<string>('TELNYX_FROM_NUMBER'),
          to,
          text: message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error sending message:', data);
        throw new Error(`Telnyx API Error: ${JSON.stringify(data)}`);
      }

      console.log('Message sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error(`Error sending message: ${error.message}`);
    }
  }

  async sendCampaign(numbers: string[], message: string) {
    const results: any = [];
    for (const number of numbers) {
      try {
        const response = await this.sendMessage(number, message);
        results.push({ number, status: 'Sent', response });
      } catch (error) {
        results.push({ number, status: 'Failed', error: error.message });
      }
    }
    return results;
  }
}
