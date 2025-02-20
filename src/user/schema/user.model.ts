import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ROLE } from '../user.role.enum';
import { ACCOUNT_TYPE, PERMISSION_LEVEL } from 'src/auth/dto/create-auth.dto';

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

  @Prop({ required: true, default: ROLE.User })
  role: number;

  @Prop({ required: true, default: Date.now })
  lastActive: Date;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: false,
    enum: PERMISSION_LEVEL,
    default: PERMISSION_LEVEL.USER,
  })
  permissionLevel: PERMISSION_LEVEL;

  @Prop({ required: true })
  consent: boolean;

  @Prop({ required: true })
  termsAgreement: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
