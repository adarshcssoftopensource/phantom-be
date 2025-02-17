import { IsBoolean, IsNumber } from 'class-validator';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';

export class CreateUserDto extends CreateAuthDto {
  @IsBoolean()
  status: boolean;

  @IsNumber()
  role: number;
}
