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
import { ROLE } from './user.role.enum';

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
    sortField?: string,
    sortOrder?: 'asc' | 'desc',
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

      const total = await this.userModel.countDocuments({
        ...searchQuery,
        role: { $eq: ROLE.User },
      });

      const sort: any = {};
      if (sortField) {
        sort[sortField] = sortOrder === 'desc' ? -1 : 1;
      }

      if (total === 0) {
        return {
          data: [],
          total,
          page: pageNum,
          limit: limitNum,
        };
      }

      // Get users based on search query, page,sorting, and limit
      const users = await this.userModel
        .find({ ...searchQuery, role: ROLE.User })
        .sort(sort)
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

  async getAllSubUsers(
    userId: string,
    page?: number,
    limit?: number,
    search?: string,
    sortField?: string,
    sortOrder?: 'asc' | 'desc',
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

      const total = await this.userModel.countDocuments({
        ...searchQuery,
        role: { $ne: ROLE.User },
        _id: { $ne: userId },
      });

      const sort: any = {};
      if (sortField) {
        sort[sortField] = sortOrder === 'desc' ? -1 : 1;
      }

      if (total === 0) {
        return {
          data: [],
          total,
          page: pageNum,
          limit: limitNum,
        };
      }

      // Get users based on search query, page, and limit
      const users = await this.userModel
        .find({
          ...searchQuery,
          role: { $ne: ROLE.User },
          _id: { $ne: userId },
        })
        .sort(sort)
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

    const user = await this.userModel
      .findById({ _id: id })
      .select('-password')
      .exec();

    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { email, password } = createUserDto;

      // Check if email already exists
      const existingUser = await this.userModel.findOne({ email }).exec();
      if (existingUser) {
        throw new BadRequestException('Email is already in use');
      }

      // Hash password
      const hashedPassword = await this.authCrypto.hashPassword(password);

      // Create user
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        consent: true,
        termsAgreement: true,
      });

      await newUser.save();

      return { message: 'User created successfully', userId: newUser._id };
    } catch (error) {
      console.error('Error in createUser:', error);
      throw new InternalServerErrorException(
        error.message,
        'Failed to create user',
      );
    }
  }

  async updateUser(userId: string, updateAuthDto: UpdateUserDto) {
    try {
      const {
        name,
        email,
        role,
        password,
        status,
        permissionLevel,
        businessName,
        accountType,
        assignedNumber,
      } = updateAuthDto;

      // Check if the user exists
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // If email is being updated, check if it's already in use
      const existingUser = await this.userModel.findOne({ email }).exec();
      if (email && email !== user.email) {
        if (existingUser) {
          throw new BadRequestException('Email is already in use');
        }
      }

      // Prepare update object
      const updateFields: UpdateUserDto = {};
      if (name) updateFields.name = name;
      if (permissionLevel) updateFields.permissionLevel = permissionLevel;
      if (accountType) updateFields.accountType = accountType;
      if (businessName) updateFields.businessName = businessName;
      if (assignedNumber) updateFields.assignedNumber = assignedNumber;
      if (status !== undefined) updateFields.status = status;
      if (role !== undefined) updateFields.role = role;
      if (password) {
        updateFields.password = await this.authCrypto.hashPassword(password);
      }

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
