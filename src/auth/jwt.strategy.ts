import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Session } from './schemas/session.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
  constructor(
  @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {
    const secret = process.env.JWT_ACCESS_SECRET
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    })
  }

  async validate(payload: any) {
    console.log(payload);
    const session = await this.sessionModel.findOne({
      userId: payload.sub,
      tokenId: payload.tokenId,
      isValid: true,
    });
  
    if (!session) {
      throw new UnauthorizedException('Session revoked or expired');
    }
    return {
      userId: payload.sub,
      userName: payload.username,
      tokenId: payload.tokenId,
    } 
  }
}