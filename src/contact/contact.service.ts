import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact, ContactDocument } from './schema/contact.schema';
import { parseCsvFile } from 'src/utils/csv-parser';
import { plainToInstance } from 'class-transformer';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  async createContact(dto: CreateContactDto) {
    try {
      const contactExists = await this.contactModel
        .findOne({ email: dto.email })
        .lean();
      if (contactExists) throw new BadRequestException('Email already exists');

      const newContact = await new this.contactModel(dto).save();
      return plainToInstance(CreateContactDto, newContact.toObject());
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch contacts: ${error.message}`,
      );
    }
  }

  async getAllContacts(
    page?: number,
    limit?: number,
    all?: boolean,
  ): Promise<{
    data: CreateContactDto[];
    total: number;
    page?: number;
    limit?: number;
  }> {
    try {
      if (all) {
        // Fetch all contacts if `all` is true
        const contacts = await this.contactModel.find().lean();
        return {
          data: plainToInstance(CreateContactDto, contacts),
          total: contacts.length,
        };
      }

      // Ensure `page` and `limit` have default values
      const pageNum = page && !isNaN(page) ? page : 1;
      const limitNum = limit && !isNaN(limit) ? limit : 10;

      const skip = (pageNum - 1) * limitNum;
      const total = await this.contactModel.countDocuments();

      if (total === 0) {
        throw new NotFoundException('No contacts found');
      }

      const contacts = await this.contactModel
        .find()
        .skip(skip)
        .limit(limitNum)
        .lean();

      return {
        data: plainToInstance(CreateContactDto, contacts),
        total,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw new BadRequestException(
        `Failed to fetch contacts: ${error.message}`,
      );
    }
  }

  async getContactById(id: string) {
    if (!id) {
      throw new Error('Contact ID is required.');
    }

    const contact = await this.contactModel.findById({ _id: id }).exec();
    if (!contact) {
      throw new Error(`Contact with ID ${id} not found.`);
    }

    return contact;
  }

  async uploadContacts(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Parse CSV file
      const contacts: CreateContactDto[] = await parseCsvFile(file);

      if (!contacts.length) {
        throw new BadRequestException('CSV file is empty or invalid');
      }

      return await this.contactModel.insertMany(contacts);
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload contacts: ${error.message}`,
      );
    }
  }

  async updateContact(id: string, dto: UpdateContactDto) {
    try {
      const updatedContact = await this.contactModel
        .findByIdAndUpdate(id, dto, { new: true })
        .lean();

      if (!updatedContact) {
        throw new NotFoundException('Contact not found');
      }

      return plainToInstance(UpdateContactDto, updatedContact);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update contact: ${error.message}`,
      );
    }
  }

  async deleteContact(id: string) {
    try {
      const deletedContact = await this.contactModel
        .findByIdAndDelete({ _id: id })
        .lean();

      if (!deletedContact) {
        throw new NotFoundException('Contact not found');
      }

      return { message: 'Contact deleted successfully' };
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete contact: ${error.message}`,
      );
    }
  }
}
