import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { User } from './schemas/user.schema';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from './request.interfaces';
import { log } from 'console';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))  // Asegúrate de que el JWT Guard esté activado
  async getProfile(@Req() req: IRequest) {
    return {
      name: req.user.name,
      email: req.user.email,
      userId: req.user.userId,
    };
    const { name, email, userId } = req.user;  // Aquí accedes a `name`, `email` y `userId`
    return { name, email, userId };
    
    return req.user;  // El perfil del usuario está disponible en req.user gracias al guard
  }
}
