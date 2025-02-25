import { Test, TestingModule } from '@nestjs/testing';
import { TelnyxController } from './telnyx.controller';
import { TelnyxService } from './telnyx.service';

describe('TelnyxController', () => {
  let controller: TelnyxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelnyxController],
      providers: [TelnyxService],
    }).compile();

    controller = module.get<TelnyxController>(TelnyxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
