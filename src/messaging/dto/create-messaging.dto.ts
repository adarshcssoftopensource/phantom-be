import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessagingDto {
  @IsNotEmpty()
  @IsMongoId()
  to: string; // Recipient phone number (e.g., +1234567890)

  @IsNotEmpty()
  @IsString()
  title: string; // SMS content

  @IsNotEmpty()
  @IsString()
  message: string; // SMS content
}
