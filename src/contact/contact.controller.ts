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
  Req,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ContactsService } from './contact.service';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateContactDto) {
    const userId = req.user.id;
    return this.contactsService.createContact(dto, userId);
  }

  @Get()
  async getAll(
    @Req() req,
    @Query('all') all?: boolean,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const userId = req.user.id;
    return this.contactsService.getAllContacts(
      userId,
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
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'text/csv' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.contactsService.uploadContacts(file, userId);
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
