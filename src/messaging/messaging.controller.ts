import {
  Controller,
  Post,
  Body,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CreateMessagingDto } from './dto/create-messaging.dto';
import { BulkMessagingDto } from './dto/bulk-messaging.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './mms',
        filename: (req, file, callback) => {
          const fileExt = extname(file.originalname);
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async sendMessage(
    @Body() messageDto: CreateMessagingDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.messagingService.sendMessage({ messageDto, userId, file });
  }

  @Post('send-bulk')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './mms',
        filename: (req, file, callback) => {
          const fileExt = extname(file.originalname);
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async sendBulkMessage(
    @Body() bulkMessageDto: BulkMessagingDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.messagingService.sendCampaign({
      bulkMessageDto,
      userId,
      file,
    });
  }
}
