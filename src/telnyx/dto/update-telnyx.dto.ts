import { PartialType } from '@nestjs/mapped-types';
import { CreateTelnyxDto } from './create-telnyx.dto';

export class UpdateTelnyxDto extends PartialType(CreateTelnyxDto) {}
