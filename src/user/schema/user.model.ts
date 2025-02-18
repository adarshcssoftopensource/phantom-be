import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ROLE } from '../user.role.enum';
import { ACCOUNT_TYPE } from 'src/auth/dto/create-auth.dto';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, default: true })
  status: boolean;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({
    required: true,
    enum: ACCOUNT_TYPE,
    default: ACCOUNT_TYPE.INDIVIDUAL,
  })
  accountType: string;

  @Prop({ required: false })
  businessName?: string;

  @Prop({ required: true, default: ROLE.Developer })
  role: number;

  @Prop({ required: true, default: Date.now })
  lastActive: Date;

  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
