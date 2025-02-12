import { Controller, Post, Body } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send')
  async sendMessage(@Body() body: { to: string; message: string }) {
    return this.messagingService.sendMessage(body.to, body.message);
  }

  @Post('send-campaign')
  async sendCampaign(@Body() body: { numbers: string[]; message: string }) {
    return this.messagingService.sendCampaign(body.numbers, body.message);
  }
}
