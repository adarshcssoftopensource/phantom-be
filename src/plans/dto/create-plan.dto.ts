import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  credits: number;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  popular?: boolean;
}
