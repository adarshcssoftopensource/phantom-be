import { Module } from '@nestjs/common';
import { TelnyxService } from './telnyx.service';
import { TelnyxController } from './telnyx.controller';

@Module({
  controllers: [TelnyxController],
  providers: [TelnyxService],
})
export class TelnyxModule {}
