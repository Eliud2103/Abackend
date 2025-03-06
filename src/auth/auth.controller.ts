import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { User } from './schemas/user.schema';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from './request.interfaces';

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
    // auth.controller.ts (Backend)
    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Req() req: IRequest) {  // Ahora TypeScript reconoce `user` en req
      return req.user;  // Debería funcionar bien, ya que `user` está en la interfaz
    }

}



