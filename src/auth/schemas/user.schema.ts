import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { HydratedDocument } from "mongoose";
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User{
  @ApiProperty({ example: 'your username' })
  @IsString()
  @Prop()
  username: string;

  @ApiProperty({ example: 'your password' })
  @IsString()
  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);