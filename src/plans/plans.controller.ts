import {
  Controller,
  Post,
  Body,
  Req,
  RawBodyRequest,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { PlansService } from './plans.service';
import { ConfigService } from '@nestjs/config';
import { Public } from '../common/decorators/public.decorator';
import { CreatePlanDto } from './dto/create-plan.dto';
import { Plan } from './schema/plan.schema';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plans')
export class PlansController {
  private endpointSecret;
  constructor(
    private readonly plansService: PlansService,
    private configService: ConfigService,
  ) {
    this.endpointSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
  }

  @Post()
  async create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  async findAll(): Promise<Plan[]> {
    return this.plansService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Plan> {
    return this.plansService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ): Promise<Plan> {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.plansService.delete(id);
  }

  @Post('create-checkout-session')
  async createCheckoutSession(@Body('planId') planId: string, @Req() req) {
    const userEmail = req.user.email;
    const session = await this.plansService.createCheckoutSession(
      planId,
      userEmail,
    );
    return { id: session.id, url: session.url };
  }

  @Public()
  @Post('webhook')
  async handleWebhook(@Req() request: RawBodyRequest<Request>) {
    const sig = request.headers['stripe-signature'] as string;
    const endpointSecret = this.endpointSecret;

    let event: Stripe.Event;
    try {
      event = this.plansService['stripe'].webhooks.constructEvent(
        request.body,
        sig,
        endpointSecret,
      );
      await this.plansService.handleWebhook(event);
      return { received: true };
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
}
