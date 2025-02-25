import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TelnyxService } from './telnyx.service';

@Controller('telnyx')
export class TelnyxController {
  constructor(private readonly telnyxService: TelnyxService) {}

  @Get('available-numbers')
  async getAvailableNumbers(@Query() queryParams: Record<string, any>) {
    return this.telnyxService.getAvailableNumbers(queryParams);
  }

  @Get('purchased-numbers')
  async getBuyedPhoneNumbers() {
    return this.telnyxService.getPurchasedNumbers();
  }

  @Post('buy-numbers')
  async buyBulkNumbers(@Body() body: Array<string>) {
    return this.telnyxService.buyNumbers(body);
  }
}
