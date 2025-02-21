import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schema/user.model';
import { Payment, PaymentSchema } from './schema/payment.schema';
import { PlanSeeder } from 'src/seeder/plan.seeder';
import { Plan, PlanSchema } from './schema/plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService, PlanSeeder],
  exports: [PlanSeeder],
})
export class PlansModule {}
