import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Telnyx from 'telnyx';
import { CreateMessagingDto } from './dto/create-messaging.dto';
import { User, UserDocument } from 'src/user/schema/user.model';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schema/message.schema';
import { Contact, ContactDocument } from 'src/contact/schema/contact.schema';
import { BulkMessagingDto } from './dto/bulk-messaging.dto';

@Injectable()
export class MessagingService {
  private telnyxClient: Telnyx;
  private fromNumber: string;
  private messaging_profile_id: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {
    this.telnyxClient = new Telnyx(
      this.configService.get<string>('TELNYX_API_KEY') ?? '',
    );
    this.fromNumber = this.configService.get<string>('TELNYX_FROM') ?? '';
    this.messaging_profile_id =
      this.configService.get<string>('TELNYX_MESSAGING_PROFILE_ID') ?? '';
  }

  async sendMessage({
    messageDto,
    userId,
    file,
  }: {
    messageDto: CreateMessagingDto;
    userId: string;
    file: Express.Multer.File | null;
  }) {
    const { to, message, messageType } = messageDto;

    try {
      const sender = await this.userModel
        .findById({ _id: new Types.ObjectId(userId) })
        .lean()
        .exec();

      const receiver = await this.contactModel
        .findOne({ _id: new Types.ObjectId(to) })
        .lean()
        .exec();

      if (!sender) throw new BadRequestException('Sender not found');
      if (!receiver) throw new BadRequestException('Receiver not found');
      if (sender.credits < (messageType === 'SMS' ? 1 : 3))
        throw new BadRequestException('Insufficient credits');

      const response = await this.send({
        to: receiver.phoneNumber,
        message,
        messageType,
        file,
      });

      // Deduct credits from sender's balance
      const creditDeduction = messageType === 'SMS' ? 1 : 3;
      await this.userModel.updateOne(
        { _id: sender._id },
        { $inc: { credits: -creditDeduction, creditsUsed: creditDeduction } },
      );

      // Save the message to the database
      const newMessage = new this.messageModel({
        sender: sender._id,
        receiver: receiver._id,
        content: message,
      });

      await newMessage.save();

      if (response.data) {
        return { message: 'Message sent successfully' };
      }
    } catch (error) {
      console.error('Telnyx SMS Error:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async sendCampaign({
    bulkMessageDto,
    userId,
    file,
  }: {
    bulkMessageDto: BulkMessagingDto;
    userId: string;
    file: Express.Multer.File | null;
  }) {
    const { numbers, message, messageType } = bulkMessageDto;
    const results: any[] = [];
    const messagesToSave: any[] = [];

    const sender = await this.userModel.findById(userId).lean().exec();
    if (!sender) throw new BadRequestException('Sender not found');

    const totalCost = numbers.length * 2;
    if (sender.credits < totalCost)
      throw new BadRequestException('Insufficient credits');

    for (const number of numbers) {
      try {
        const response = await this.send({
          to: number,
          message,
          messageType,
          file,
        });

        // Save message only if successfully sent
        const newMessage = new this.messageModel({
          sender: userId,
          receiver: number,
          content: message,
        });

        messagesToSave.push(newMessage);
        results.push({ number, status: 'Sent', response });
      } catch (error) {
        results.push({ number, status: 'Failed', error: error.message });
      }
    }

    // Deduct credits only if messages were sent
    if (messagesToSave.length > 0) {
      await this.userModel.updateOne(
        { _id: userId },
        { $inc: { credits: -totalCost, creditsUsed: totalCost } },
      );
      await this.messageModel.insertMany(messagesToSave);
    }

    return { message: 'Bulk messages processed', results };
  }

  private async send({
    to,
    message,
    messageType,
    file = null,
  }: {
    to: string;
    message: string;
    messageType: string;
    file?: Express.Multer.File | null;
  }) {
    try {
      const messageOptions: any = {
        from: this.fromNumber,
        to,
        text: message,
        type: messageType,
        use_profile_webhooks: false,
        auto_detect: true,
        messaging_profile_id: this.messaging_profile_id,
      };

      // Include file (media_urls) only if messageType is MMS and file is provided
      if (messageType === 'MMS' && file) {
        const fileUrl = await this.uploadFile(file);
        messageOptions.media_urls = [fileUrl];
        console.log('fileUrl:', fileUrl);
      }
      const response = await this.telnyxClient.messages.create(messageOptions);
      return response;
    } catch (error) {
      console.error('Telnyx SMS Error:', error.raw);
      throw new InternalServerErrorException(error.raw.detail);
    }
  }
  uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      return Promise.resolve(`http://localhost:8080/mms/${file.filename}`);
    } catch (error) {
      console.error('File upload error:', error);
      throw new InternalServerErrorException('Error uploading file');
    }
  }
}
