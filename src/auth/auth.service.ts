import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSchema, User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';



@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService) {}
  
  async createUser(dto: CreateAuthDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = new this.userModel({
      ...dto,
      password: hashedPassword,
    })

    return newUser.save();
  }
  

  async login(loginDto: CreateAuthDto) {
    const user = await this.userModel.findOne({ username: loginDto.username });
    console.log('INPUT PASSWORD:', loginDto.password);
    console.log('DB PASSWORD:', user?.password);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatched = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatched){
      throw new UnauthorizedException('Wrong password');
    }
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {secret:process.env.JWT_SECRET }),
    }
  }

  async verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      return decoded;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async create(createAuthDto: CreateAuthDto): Promise<User>{
    const createdUser = new this.userModel(createAuthDto);
    return createdUser.save();
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
