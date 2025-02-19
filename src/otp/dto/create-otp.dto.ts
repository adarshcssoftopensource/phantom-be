import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';

export class CreateOtpDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phoneNumber?: string;

  @IsNotEmpty({ message: 'Either email or phone number is required' })
  contact: string;
}
