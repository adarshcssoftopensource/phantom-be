import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class BulkMessagingDto {
  @IsArray()
  @IsNotEmpty()
  numbers: string[];

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
