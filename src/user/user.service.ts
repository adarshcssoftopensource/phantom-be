import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.model';
import { Model } from 'mongoose';
import { AuthCrypto } from 'src/auth/auth.utils';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private authCrypto: AuthCrypto,
  ) {}

  async getAllUsers(
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{
    data: CreateUserDto[];
    total: number;
    page?: number;
    limit?: number;
  }> {
    try {
      const pageNum = page && !isNaN(page) ? page : 1;
      const limitNum = limit && !isNaN(limit) ? limit : 10;

      const skip = (pageNum - 1) * limitNum;

      const searchQuery = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const total = await this.userModel.countDocuments(searchQuery);

      if (total === 0) {
        throw new NotFoundException(
          'No users found matching the search criteria',
        );
      }

      // Get users based on search query, page, and limit
      const users = await this.userModel
        .find(searchQuery)
        .select('-password')
        .skip(skip)
        .limit(limitNum)
        .lean();

      return {
        data: plainToInstance(CreateUserDto, users),
        total,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async getUserById(id: string) {
    if (!id) {
      throw new Error('User ID is required.');
    }

    const user = await this.userModel.findById({ _id: id }).exec();
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }

    return user;
  }

  async updateUser(userId: string, updateAuthDto: UpdateUserDto) {
    try {
      const { name, email, password, status } = updateAuthDto;

      // Check if the user exists
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // If email is being updated, check if it's already in use
      if (email && email !== user.email) {
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
          throw new BadRequestException('Email is already in use');
        }
      }

      // Prepare update object
      const updateFields: UpdateUserDto = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (status !== undefined) updateFields.status = status;
      if (password)
        updateFields.password = await this.authCrypto.hashPassword(password);

      // Use findByIdAndUpdate for efficient updating
      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, updateFields, { new: true })
        .select('-password')
        .exec();

      if (!updatedUser)
        return new InternalServerErrorException('Failed to update user');

      return updatedUser;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.userModel.findByIdAndDelete(userId);
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async profile(userId: string) {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('-password')
        .lean();

      if (!user) throw new NotFoundException('User not found');

      return user;
    } catch (error) {
      console.error('Error while getting profile:', error);
      throw new InternalServerErrorException('Failed to retrieve profile');
    }
  }
}
