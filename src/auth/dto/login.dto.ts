import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: 'your username' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'your password' })
  @IsString()
  password: string;
}