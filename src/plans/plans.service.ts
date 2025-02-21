import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/schema/user.model';
import Stripe from 'stripe';
import { Payment, PaymentDocument } from './schema/payment.schema';
import { CreatePlanDto } from './dto/create-plan.dto';
import { Plan, PlanDocument } from './schema/plan.schema';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  private stripe: Stripe;
  private successUrl: string;
  private errorUrl: string;
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') ?? '',
      {
        apiVersion: '2025-01-27.acacia',
      },
    );

    this.successUrl = this.configService.get<string>('SUCCESS_URL') ?? '';
    this.errorUrl = this.configService.get<string>('ERROR_URL') ?? '';
  }

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const newPlan = new this.planModel(createPlanDto);
    return newPlan.save();
  }

  async findAll(): Promise<Plan[]> {
    return this.planModel.find().exec();
  }

  async findById(id: string): Promise<Plan> {
    const plan = await this.planModel.findById(id).exec();
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const updatedPlan = await this.planModel
      .findByIdAndUpdate(id, updatePlanDto, { new: true })
      .exec();
    if (!updatedPlan) {
      throw new NotFoundException('Plan not found');
    }
    return updatedPlan;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.planModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Plan not found');
    }
    return { message: 'Plan deleted successfully' };
  }

  async createCheckoutSession(
    planId: string,
    userEmail: string,
  ): Promise<Stripe.Checkout.Session> {
    const plans = [
      {
        id: '1',
        name: 'Starter',
        credits: 100,
        price: 10,
        features: [
          '100 Credits',
          'Basic Support',
          'Access to Core Features',
          '24/7 Customer Service',
        ],
        popular: false,
      },
      {
        id: '2',
        name: 'Pro',
        credits: 500,
        price: 29,
        features: ['500  Credits', 'Basic Support', '24/7 Customer Service'],
        popular: true,
      },
      {
        id: '3',
        name: 'Enterprise',
        credits: 2000,
        price: 99,
        features: ['2000  Credits', 'Dedicated Support', 'Custom Solutions'],
        popular: false,
      },
    ];

    const plan = plans.find((p) => p.id === planId);

    if (!plan) throw new Error('Invalid plan ID');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.credits} Credits`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: this.successUrl,
      cancel_url: this.errorUrl,
      metadata: {
        userEmail,
        credits: plan.credits.toString(),
        planName: plan.name,
      },
    });

    await this.paymentModel.create({
      userEmail,
      status: 'pending', // Mark as pending until confirmed
      amount: plan.price / 100, // Convert cents to dollars
      credits: plan.credits,
      sessionId: session.id,
      planName: plan.name,
    });

    return session;
  }

  async handleWebhook(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.metadata) return;

    const userEmail = session.metadata.userEmail;
    const planName = session.metadata.planName;
    const credits = parseInt(session.metadata.credits, 10);

    if (event.type === 'checkout.session.completed') {
      // ✅ Payment success: Update credits and mark payment as successful
      await this.userModel.updateOne(
        { email: userEmail },
        { $inc: { credits }, $set: { plan: planName } },
        { upsert: true },
      );

      await this.paymentModel.updateOne(
        { sessionId: session.id },
        { status: 'success' },
      );
    } else if (event.type === 'checkout.session.expired') {
      // ❌ Payment failed: Update status
      await this.paymentModel.updateOne(
        { sessionId: session.id },
        { status: 'failed', errorMessage: 'Session expired' },
      );
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await this.paymentModel.updateOne(
        { sessionId: session.id },
        {
          status: 'failed',
          errorMessage:
            paymentIntent.last_payment_error?.message || 'Payment failed',
        },
      );
    }
  }
}
