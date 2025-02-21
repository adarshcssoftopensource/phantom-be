import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  credits: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ default: false })
  popular: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
