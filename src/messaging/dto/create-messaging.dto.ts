import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMessagingDto {
  @IsNotEmpty()
  @IsMongoId()
  to: string;

  @IsNotEmpty()
  @IsString()
  message: string; // SMS content

  @IsNotEmpty()
  @IsEnum(['SMS', 'MMS'])
  messageType: string;

  @IsOptional()
  file?: string;
}
