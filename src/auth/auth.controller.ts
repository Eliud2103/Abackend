import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException, Put, ConflictException, UploadedFile, UseInterceptors, NotFoundException, Param, Res } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { adminDto } from './dto/admin.dto';
import { User } from './schemas/user.schema';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from './request.interfaces';
import { log } from 'console';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterHospitalDto } from './dto/register-hospital.dto';
import { RegisterFarmaciaDto } from './dto/register-farmacia.dto';
import { FileInterceptor } from '@nestjs/platform-express'; // Importar el interceptor de archivos
import { GridFSService } from '../auth/gridfs.service'; // Asegúrate de tener el servicio de GridFS
import { Response } from 'express'; // ✅ Importar correctamente


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly gridFsService: GridFSService, // Inyectar el servicio de GridFS
  ) {}
 
  
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Post('adminRegister')
  async adminRegister(@Body() adminDto: adminDto): Promise<User> {
    return this.authService.adminRegister(adminDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))  // Asegúrate de que el JWT Guard esté activado
  async  getProfile(@Req() req: IRequest) {
    console.log('User data in backend:', req.user); // Verifica los datos que llegan al backend
    return {
      fullName: req.user.fullName,
      lastNameFather: req.user.lastNameFather,
      lastNameMother: req.user.lastNameMother,
      email: req.user.email,
      userId: req.user.userId,
    };
  }




  
  @Get('my-data')
  @UseGuards(JwtAuthGuard)  
  async getMyData(@Req() req: IRequest) {
    const userId = req.user.userId; // Asegúrate de que 'userId' esté en el token
    const user = await this.authService.getUserById(userId);
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  
    return user;  // Devuelve todos los datos del usuario
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

  //////////////////////////// Hospital ///////////////////////////
  @Post('hos-register')
  async hosRegister(@Body() hospitalDto: RegisterHospitalDto) {
    try {
      const newHospital = await this.authService.registerHospital(hospitalDto);
      return newHospital;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('El correo electrónico ya está en uso.');
      }
      throw error;
    }
  }

  //////////////////////////// Farmacia ///////////////////////////
  @Post('far-register')  // Ruta para registrar farmacia
  async farRegister(@Body() farmaciaDto: RegisterFarmaciaDto) {
    try {
      const newFarmacia = await this.authService.registerFarmacia(farmaciaDto);
      return newFarmacia;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('El correo electrónico ya está en uso.');
      }
      throw error;
    }
  }

  //////////////////////////// Subida de imagen ///////////////////////////

  @Post('images/upload')
  @UseInterceptors(FileInterceptor('image'))  
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const fileId = await this.gridFsService.uploadFile(file);
    return { fileId }; // Devolver el ID en lugar de una URL
  }

  @Get('images/:fileId')
  async getImage(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      const { stream, contentType } = await this.gridFsService.getFile(fileId);

      res.set('Content-Type', contentType);
      stream.pipe(res);
    } catch (error) {
      throw new NotFoundException('Imagen no encontrada');
    }
  }
  
}
