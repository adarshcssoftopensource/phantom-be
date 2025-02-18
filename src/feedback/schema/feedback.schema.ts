import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
} from '../dto/create-feedback.dto';
import { User } from 'src/user/schema/user.model';

@Schema({ timestamps: true })
export class Feedback extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: FeedbackCategory })
  category: FeedbackCategory;

  @Prop({ required: true, enum: FeedbackPriority })
  priority: FeedbackPriority;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: FeedbackStatus,
    default: FeedbackStatus.PENDING,
  })
  status: FeedbackStatus;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
