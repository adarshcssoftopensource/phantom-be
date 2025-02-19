import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  Query,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ContactsService } from './contact.service';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) { }

  @Post()
  async create(@Body() dto: CreateContactDto) {
    return this.contactsService.createContact(dto);
  }

  @Get()
  async getAll(
    @Query('all') all?: boolean,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.contactsService.getAllContacts(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      all,
      search,
      sortField,
      sortOrder,
    );
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.contactsService.getContactById(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'text/csv' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.contactsService.uploadContacts(file);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return await this.contactsService.updateContact(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.contactsService.deleteContact(id);
  }
}
