import { PickType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export enum ACCOUNT_TYPE {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export enum PERMISSION_LEVEL {
  READ_ONLY = 'read-only',
  EDITOR = 'editor',
  MANAGER = 'manager',
  USER = 'user',
}

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber: string;

  @IsEnum(ACCOUNT_TYPE, {
    message: 'Account type must be individual or business',
  })
  accountType: ACCOUNT_TYPE;

  @IsOptional()
  @IsEnum(PERMISSION_LEVEL)
  permissionLevel: PERMISSION_LEVEL;

  @IsOptional()
  @IsString({ message: 'Business name must be a string' })
  businessName?: string;

  @IsOptional()
  @IsBoolean()
  status: boolean;

  @IsOptional()
  @IsNumber()
  role: number;

  @IsNotEmpty({ message: 'Consent is required' })
  @IsBoolean()
  consent: boolean;

  @IsNotEmpty({ message: 'Terms agreement is required' })
  @IsBoolean()
  termsAgreement: boolean;

  @IsOptional()
  @IsString()
  assignedNumber: string;
}

export class CreateLoginDto extends PickType(CreateAuthDto, [
  'email',
  'password',
] as const) {}
