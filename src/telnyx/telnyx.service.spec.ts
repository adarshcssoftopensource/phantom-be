import { Test, TestingModule } from '@nestjs/testing';
import { TelnyxService } from './telnyx.service';

describe('TelnyxService', () => {
  let service: TelnyxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelnyxService],
    }).compile();

    service = module.get<TelnyxService>(TelnyxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
