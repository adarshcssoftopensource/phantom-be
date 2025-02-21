import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  status: string; // 'success' | 'failed'

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  credits: number;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  planName: string;

  @Prop()
  errorMessage?: string;
}

export type PaymentDocument = Payment & Document;
export const PaymentSchema = SchemaFactory.createForClass(Payment);
