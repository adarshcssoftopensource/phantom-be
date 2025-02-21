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

  async createContact(dto: CreateContactDto, userId: string) {
    try {
      const contactExists = await this.contactModel
        .findOne({ email: dto.email })
        .lean();
      if (contactExists) throw new BadRequestException('Email already exists');

      const newContact = await new this.contactModel({ ...dto, userId }).save();
      return plainToInstance(CreateContactDto, newContact.toObject());
    } catch (error) {
      throw new BadRequestException(`Failed to add contact: ${error.message}`);
    }
  }

  async getAllContacts(
    userId: string,
    page?: number,
    limit?: number,
    all?: boolean,
    search?: string,
    sortField?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<{
    data: CreateContactDto[];
    total: number;
    page?: number;
    limit?: number;
  }> {
    try {
      if (all) {
        // Fetch all contacts if `all` is true
        const contacts = await this.contactModel.find({ userId }).lean();
        return {
          data: plainToInstance(CreateContactDto, contacts),
          total: contacts.length,
        };
      }

      // Ensure `page` and `limit` have default values
      const pageNum = page && !isNaN(page) ? page : 1;
      const limitNum = limit && !isNaN(limit) ? limit : 10;

      const skip = (pageNum - 1) * limitNum;

      const filter: any = {};
      if (search) {
        filter.$or = [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { phoneNumber: new RegExp(search, 'i') },
        ];
      }

      const sort: any = {};
      if (sortField) {
        sort[sortField] = sortOrder === 'desc' ? -1 : 1;
      }
      const total = await this.contactModel.countDocuments({
        ...filter,
        userId,
      });

      const contacts = await this.contactModel
        .find({ ...filter, userId })
        .sort(sort)
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

  async uploadContacts(file: Express.Multer.File, userId: string) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const contacts: CreateContactDto[] = await parseCsvFile(file);

      if (!contacts.length) {
        throw new BadRequestException('CSV file is empty or invalid');
      }

      // Extract emails and phoneNumbers from the parsed contacts
      const emails = contacts.map((contact) => contact.email);
      const phoneNumbers = contacts.map((contact) => contact.phoneNumber);

      // Find existing contacts in the database
      const existingContacts = await this.contactModel.find({
        $or: [
          { email: { $in: emails } },
          { phoneNumber: { $in: phoneNumbers } },
        ],
        userId,
      });

      if (existingContacts.length > 0) {
        // Separate duplicate emails and phoneNumbers into distinct arrays
        const duplicateEmails = existingContacts
          .map((contact) => contact.email)
          .filter((email) => email);

        const duplicatePhoneNumbers = existingContacts
          .map((contact) => contact.phoneNumber)
          .filter((phoneNumber) => phoneNumber);

        throw new BadRequestException({
          message:
            'We have found duplicate contacts in your file. Please review and remove them before re-uploading the file.',
          duplicateEmails,
          duplicatePhoneNumbers,
        });
      }

      // If no duplicates, insert the contacts
      await this.contactModel.insertMany(
        contacts.map((contact) => ({ ...contact, userId })),
      );

      return {
        status: true,
        message: 'All contacts uploaded successfully',
      };
    } catch (error) {
      throw new BadRequestException({
        message: error.message || 'Failed to upload contacts',
        error: 'Bad Request',
        statusCode: 400,
        duplicateEmails: error.response?.duplicateEmails || [],
        duplicatePhoneNumbers: error.response?.duplicatePhoneNumbers || [],
      });
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
