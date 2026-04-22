import { ApiProperty } from "@nestjs/swagger";

export class RefreshDto {
  @ApiProperty({example: 'your refresh token'})
  refreshToken: string;
}