import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class BulkMessagingDto {
  @IsArray()
  @IsNotEmpty()
  numbers: string[];

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  @IsEnum(['SMS', 'MMS'])
  messageType: string;

  @IsOptional()
  file?: string;
}
