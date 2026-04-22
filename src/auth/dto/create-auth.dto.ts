import { IsString } from "class-validator";
import { User } from "../schemas/user.schema";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAuthDto {
    @ApiProperty({ example: 'your username' })
    @IsString()
    username: string;
  
    @ApiProperty({ example: 'your password' })
    @IsString()
    password: string;
}
