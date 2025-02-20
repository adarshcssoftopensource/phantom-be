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

  async getFeedbackById(id: string): Promise<Feedback[]> {
    try {
      if (!isValidObjectId(id)) {
        throw new BadRequestException('Invalid user ID');
      }
      return await this.feedbackModel
        .find({ userId: id })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    } catch (error) {
      this.logger.error('Error retrieving feedback', error);
      throw new InternalServerErrorException('Failed to retrieve feedback');
    }
  }

  async getAllFeedbacks(
    page?: number,
    limit?: number,
  ): Promise<{
    data: CreateFeedbackDto[];
    total: number;
    page?: number;
    limit?: number;
  }> {
    try {
      const pageNum = page && !isNaN(page) ? page : 1;
      const limitNum = limit && !isNaN(limit) ? limit : 10;

      const skip = (pageNum - 1) * limitNum;

      const total = await this.feedbackModel.countDocuments();

      const feedbacks = await this.feedbackModel
        .find()
        .skip(skip)
        .limit(limitNum)
        .lean();

      if (!feedbacks) {
        throw new NotFoundException('Feedback not found');
      }
      return {
        data: plainToInstance(CreateFeedbackDto, feedbacks),
        total,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      this.logger.error(`Error retrieving feedback`, error.message);
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
