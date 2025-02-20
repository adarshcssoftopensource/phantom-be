import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ContactsController } from './contact.controller';
import { ContactsService } from './contact.service';
import { Contact, ContactSchema } from './schema/contact.schema';
import { User, UserSchema } from 'src/user/schema/user.model';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
    }),
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}
