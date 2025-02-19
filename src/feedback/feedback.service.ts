import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Feedback } from './schema/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectModel(Feedback.name) private readonly feedbackModel: Model<Feedback>,
  ) {}

  async createFeedback(
    userId: string,
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    try {
      const feedback = new this.feedbackModel({ ...createFeedbackDto, userId });
      return await feedback.save();
    } catch (error) {
      this.logger.error('Error creating feedback', error);
      throw new InternalServerErrorException('Failed to create feedback');
    }
  }

  async getAllFeedback(userId: string): Promise<Feedback[]> {
    try {
      return await this.feedbackModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    } catch (error) {
      this.logger.error('Error retrieving feedback', error);
      throw new InternalServerErrorException('Failed to retrieve feedback');
    }
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid feedback ID');
    }

    try {
      const feedback = await this.feedbackModel.findById(id).lean().exec();
      if (!feedback) {
        throw new NotFoundException('Feedback not found');
      }
      return feedback;
    } catch (error) {
      this.logger.error(`Error retrieving feedback with ID ${id}`, error);
      throw new InternalServerErrorException('Failed to retrieve feedback');
    }
  }

  async updateFeedback(id: string, dto: Partial<UpdateFeedbackDto>) {
    try {
      const updatedFeedback = await this.feedbackModel
        .findByIdAndUpdate(id, dto, { new: true })
        .lean();

      if (!updatedFeedback) {
        throw new NotFoundException('Contact not found');
      }

      return plainToInstance(UpdateFeedbackDto, updatedFeedback);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update contact: ${error.message}`,
      );
    }
  }
}
