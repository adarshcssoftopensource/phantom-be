import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from 'src/plans/schema/plan.schema';

@Injectable()
export class PlanSeeder {
  constructor(@InjectModel(Plan.name) private planModel: Model<PlanDocument>) {}

  async seed() {
    const existingPlans = await this.planModel.countDocuments();
    if (existingPlans > 0) {
      console.log('Plans already exist. Skipping seeding.');
      return;
    }

    const plans = [
      {
        name: 'Starter',
        credits: 100,
        price: 10,
        features: ['100 Credits', 'Basic Support', '24/7 Customer Service'],
        popular: false,
      },
      {
        name: 'Pro',
        credits: 500,
        price: 29,
        features: ['500 Credits', 'Basic Support', '24/7 Customer Service'],
        popular: true,
      },
      {
        name: 'Enterprise',
        credits: 2000,
        price: 99,
        features: ['2000 Credits', 'Dedicated Support', 'Custom Solutions'],
        popular: false,
      },
    ];

    await this.planModel.insertMany(plans);
    console.log('✅ Default plans seeded successfully');
  }
}
