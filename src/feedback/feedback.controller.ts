import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';
import { Feedback } from './schema/feedback.schema';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Req() req,
  ): Promise<Feedback> {
    const userId = req.user.id;
    return this.feedbackService.createFeedback(userId, createFeedbackDto);
  }

  @Get()
  async getFeedbacks(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedbackService.getAllFeedbacks(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('/per-user')
  async getFeedback(@Req() req): Promise<Feedback[]> {
    const userId = req.user.id;
    return this.feedbackService.getFeedbackById(userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateFeedbackDto>,
  ) {
    return await this.feedbackService.updateFeedback(id, dto);
  }
}
