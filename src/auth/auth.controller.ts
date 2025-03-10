import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException, Put, ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { User } from './schemas/user.schema';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from './request.interfaces';
import { log } from 'console';
import { JwtAuthGuard } from './jwt-auth.guard';

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
    console.log('User data in backend:', req.user); // Verifica los datos que llegan al backend
    return {
      fullName: req.user.fullName,
      email: req.user.email,
      userId: req.user.userId,
    };
  }
  @UseGuards(JwtAuthGuard) // Usar un guardia para asegurar que el usuario está autenticado
@Put('change-password')
async changePassword(
  @Req() req: IRequest,
  @Body() body: { contrasena_actual: string; nueva_contrasena: string; confirmar_nueva_contrasena: string }
): Promise<{ message: string }> {
  const userId = req.user['sub']; // Asegúrate de que 'sub' esté presente en req.user
  if (body.nueva_contrasena !== body.confirmar_nueva_contrasena) {
    throw new ConflictException('Las nuevas contraseñas no coinciden');
  }
  return this.authService.updatePassword(userId, body.contrasena_actual, body.nueva_contrasena);
}

  
}
