import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({timestamps: true})
export class Session{

  @Prop({type: Types.ObjectId, ref: 'User', required: true})
  userId: string;

  @Prop({required: true})
  tokenId: string;

  @Prop()
  device: string;

  @Prop()
  ip: string;

  @Prop({default: true})
  isValid: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
