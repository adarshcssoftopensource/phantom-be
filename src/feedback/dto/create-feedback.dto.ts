import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum FeedbackCategory {
  BUG = 'bug',
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  OTHER = 'other',
}

export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum FeedbackStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
}

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(FeedbackCategory)
  category: FeedbackCategory;

  @IsEnum(FeedbackPriority)
  priority: FeedbackPriority;

  @IsEnum(FeedbackStatus)
  @IsOptional()
  status: FeedbackStatus;
}
