import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.model';
import { AuthCrypto } from './auth.utils';
import { CreateAuthDto, CreateLoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private authCrypto: AuthCrypto,
  ) { }

  async signUp(signUpDto: CreateAuthDto) {
    try {
      const { email, name, password } = signUpDto;

      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email }).exec();

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Hash Password
      const hashedPassword = await this.authCrypto.hashPassword(password);

      // Save User
      const user = new this.userModel({
        email,
        name,
        password: hashedPassword,
      });

      await user.save();
      const token = this.jwtService.sign(
        { id: user._id, email: user.email },
        { expiresIn: '1h' }, // Token expires in 1 hour
      );

      return {
        token,
        expiresIn: '1 hour',
      };
    } catch (error) {
      console.error('Error in signUp:', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: CreateLoginDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.userModel.findOne({ email }).exec();
      if (!user) throw new UnauthorizedException('Invalid email or password');

      // Compare passwords securely
      const isMatch = await this.authCrypto.comparePasswords(
        password,
        user.password,
      );
      user.status = 'active';
      await user.save();

      if (!isMatch)
        throw new UnauthorizedException('Invalid email or password');

      const token = this.jwtService.sign(
        { id: user._id, email: user.email },
        { expiresIn: '1h' }, // Token expires in 1 hour
      );

      return {
        token,
        expiresIn: '1 hour',
      };
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  async profiles(userId: string) {
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

  async getAllUsers() {
    try {
      // Get all users from the database excluding passwords
      const users = await this.userModel.find().select('-password').lean().exec();
      if (!users || users.length === 0) {
        throw new NotFoundException('No users found');
      }

      return users;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }


  async updateUser(userId: string, updateAuthDto: UpdateAuthDto) {
    try {
      const { name, email, password } = updateAuthDto;
      // Find the user
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // If the email is being updated, check if it's already in use
      if (email && email !== user.email) {
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
          throw new BadRequestException('Email is already in use');
        }
      }
      // Hash new password if provided
      if (password) {
        user.password = await this.authCrypto.hashPassword(password);
      }
      // Update user details
      user.name = name || user.name;
      user.email = email || user.email;

      await user.save();

      return {
        id: user._id,
        name: user.name,
        email: user.email,
      };
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

      // Delete the user
      await this.userModel.findByIdAndDelete(userId);

    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

}
