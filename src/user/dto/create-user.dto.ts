import { OmitType } from '@nestjs/mapped-types';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';

export class CreateUserDto extends OmitType(CreateAuthDto, [
  'consent',
  'termsAgreement',
] as const) {}
