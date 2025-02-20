import { Controller, Post, Body, Req } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CreateMessagingDto } from './dto/create-messaging.dto';
import { BulkMessagingDto } from './dto/bulk-messaging.dto';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send')
  async sendMessage(@Body() messageDto: CreateMessagingDto, @Req() req) {
    const userId = req.user.id;
    return this.messagingService.sendMessage({ messageDto, userId });
  }

  @Post('send-bulk')
  async sendBulkMessage(@Body() bulkMessageDto: BulkMessagingDto, @Req() req) {
    const userId = req.user.id;
    return this.messagingService.sendCampaign({ bulkMessageDto, userId });
  }
}
