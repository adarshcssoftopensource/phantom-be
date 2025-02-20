import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessagingDto {
  @IsNotEmpty()
  @IsMongoId()
  to: string;

  @IsNotEmpty()
  @IsString()
  message: string; // SMS content
}
