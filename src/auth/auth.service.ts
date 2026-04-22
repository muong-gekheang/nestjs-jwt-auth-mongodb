import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Session } from './schemas/session.schema';
import { LoginDto } from './dto/login.dto';
import UAParser from 'ua-parser-js';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Session.name) private sessionModel : Model<Session>,
    private jwtService: JwtService) {}
  
  async createUser(dto: CreateAuthDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = new this.userModel({
      ...dto,
      password: hashedPassword,
    })

    return newUser.save();
  }
  

  async login(loginDto: LoginDto, req: any) {
    const parser = new (UAParser as any)(req.headers['user-agent']);
    const result = parser.getResult();
    const rawIp =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress;

    const ip = rawIp?.replace('::ffff:', '');
    const device = `${result.browser.name || 'Unknown'} on ${result.os.name || 'Unknown'}`;
    const user = await this.userModel.findOne({ username: loginDto.username });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatched = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatched){
      throw new UnauthorizedException('Wrong password');
    }
    const tokenId = uuidv4();

    const existingSession = await this.sessionModel.findOne({
      userId: user.id,
      device,
      ip,
      isValid: true,
    });

    if (existingSession) {
      existingSession.tokenId = tokenId;
      await existingSession.save();
    } else {
      await this.sessionModel.create({
        userId: user.id,
        tokenId,
        device: device,
        ip:ip,
        isValid: true
      })
    } 
    

    const accessPayload = {
      username: user.username, 
      sub: user.id,
      tokenId: tokenId,
    }
    const refreshPayload = {
      sub: user.id,
      tokenId: tokenId,
    };
    return {
      access_token: this.jwtService.sign(accessPayload, {secret: process.env.JWT_ACCESS_SECRET}),
      refresh_token: this.jwtService.sign(refreshPayload, {secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d', })
    }
  }

  async verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
      return decoded;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(token: string) {
    let payload;
    try {
      payload = this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET, })
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionModel.findOne({
      userId: payload.sub,
      tokenId: payload.tokenId,
      isValid: true,
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or expired');
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User is not found');
    }
    
    const newTokenId = uuidv4();
    session.tokenId = newTokenId;
    await session.save();

    const newAccessPayload = {
      sub: user.id,
      username: user.username,
    };
  
    const newRefreshPayload = {
      sub: user.id,
      tokenId: newTokenId,
    };
    return {
      access_token: this.jwtService.sign(newAccessPayload, { secret: process.env.JWT_ACCESS_SECRET }),
      refresh_token: this.jwtService.sign(newRefreshPayload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d'}),
      
    }
  }

  async logout(token: string) {
    const payload = await this.jwtService.verify(token, {secret: process.env.JWT_REFRESH_SECRET,})
    await this.sessionModel.updateOne({
      userId: payload.sub,
      tokenId: payload.tokenId,
    }, {
      isValid: false
    })

    return { message: "Logged out from this device" };
  }

  async logoutAll(userId: string) {
    await this.sessionModel.updateMany(
      { userId },
      { isValid: false },
    );
    console.log('logoutAll userId:', userId);
    return { message: "Logged out from all devices" };
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
