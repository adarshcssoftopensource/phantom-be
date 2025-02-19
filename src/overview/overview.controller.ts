import { Controller, Get } from '@nestjs/common';
import { OverviewService } from './overview.service';

@Controller('overview')
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get('stats')
  async getStats() {
    return this.overviewService.getDashboardStats();
  }
}
