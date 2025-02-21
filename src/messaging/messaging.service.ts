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
  }: {
    messageDto: CreateMessagingDto;
    userId: string;
  }) {
    const { to, message } = messageDto;

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
      if (sender.credits < 2)
        throw new BadRequestException('Insufficient credits');

      const response = await this.send({
        to: receiver.phoneNumber,
        message,
      });

      // Deduct 2 credits from sender's balance
      await this.userModel.updateOne(
        { _id: sender._id },
        { $inc: { credits: -2, creditsUsed: 2 } },
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
  }: {
    bulkMessageDto: BulkMessagingDto;
    userId: string;
  }) {
    const { numbers, message } = bulkMessageDto;
    const results: any[] = [];
    const messagesToSave: any[] = [];

    const sender = await this.userModel.findById(userId).lean().exec();
    if (!sender) throw new BadRequestException('Sender not found');

    const totalCost = numbers.length * 2;
    if (sender.credits < totalCost)
      throw new BadRequestException('Insufficient credits');

    for (const number of numbers) {
      try {
        const response = await this.send({ to: number, message });

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

  private async send({ to, message }) {
    try {
      const response = await this.telnyxClient.messages.create({
        from: this.fromNumber,
        to,
        text: message,
        use_profile_webhooks: false,
        auto_detect: true,
        messaging_profile_id: this.messaging_profile_id,
      });

      return response;
    } catch (error) {
      console.error('Telnyx SMS Error:', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
