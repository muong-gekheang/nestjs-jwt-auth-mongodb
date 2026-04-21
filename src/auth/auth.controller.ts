import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, UseGuards, Request, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  
  @Post('login')
  async login(@Body() body: CreateAuthDto) {
    console.log('Login body:', body);
    return this.authService.login(body);

  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
    getProfile(@Request() req) {
      return req.user;
  }

  @Post('sign-up')
  signUp(@Body() dto: CreateAuthDto) {
    return this.authService.createUser(dto);
  }

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }
    

  @Get('')
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
