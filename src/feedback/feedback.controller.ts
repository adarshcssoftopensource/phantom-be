import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
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

  @Get(':id')
  async getAllFeedback(@Param('id') userId: string): Promise<Feedback[]> {
    return this.feedbackService.getAllFeedback(userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateFeedbackDto>,
  ) {
    return await this.feedbackService.updateFeedback(id, dto);
  }

  // @Get(':id')
  // async getFeedbackById(@Param('id') id: string): Promise<Feedback> {
  //   return this.feedbackService.getFeedbackById(id);
  // }
}
