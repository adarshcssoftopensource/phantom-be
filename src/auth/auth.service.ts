import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthCrypto } from './auth.utils';
import { CreateAuthDto, CreateLoginDto } from './dto/create-auth.dto';
import { User, UserDocument } from 'src/user/schema/user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private authCrypto: AuthCrypto,
  ) {}

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

      if (!isMatch)
        throw new UnauthorizedException('Invalid email or password');

      const token = this.jwtService.sign(
        { id: user._id, email: user.email },
        { expiresIn: '1h' }, // Token expires in 1 hour
      );

      await this.userModel.updateOne(
        { email },
        { $set: { lastActive: new Date() } },
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
}
