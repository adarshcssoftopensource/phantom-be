import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { PlanSeeder } from './plan.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const planSeeder = app.get(PlanSeeder);

  try {
    console.log('🔄 Seeding plans...');
    await planSeeder.seed();
    console.log('✅ Plans seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
