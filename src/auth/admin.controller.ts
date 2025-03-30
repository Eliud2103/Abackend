import { Controller, Post, Body, UseGuards, Put, Req, ConflictException, NotFoundException, Param, Get } from '@nestjs/common';
import { AdminService } from './admin.service'; // Importa tu servicio de administración
import { adminDto } from './dto/admin.dto'; // DTO para registrar administradores
import { User } from './schemas/user.schema'; // Esquema de usuario
import { JwtAuthGuard } from './jwt-auth.guard'; // Usar el guardia JWT para proteger rutas
import { IRequest } from './request.interfaces'; // Interfaz para la solicitud

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Registro de un nuevo administrador
  @Post('register')
  async adminRegister(@Body() adminDto: adminDto): Promise<User> {
    try {
      return await this.adminService.adminRegister(adminDto);
    } catch (error) {
      if (error.code === 11000) { // Si el correo ya está en uso
        throw new ConflictException('El correo electrónico ya está en uso.');
      }
      throw error; // Si ocurre otro error
    }
  }

  // Ruta protegida para obtener el perfil del administrador
  @UseGuards(JwtAuthGuard) // Usar guardia JWT para proteger la ruta
  @Get('profile')
  async getProfile(@Req() req: IRequest) {
    console.log('Datos del administrador en backend:', req.user);
    return {
      fullName: req.user.fullName,
      email: req.user.email,
      userId: req.user.userId,
      role: req.user.role,
    };
  }

  // Cambiar contraseña de administrador (ruta protegida)
  @UseGuards(JwtAuthGuard) // Usar guardia JWT para proteger la ruta
  @Put('change-password')
  async changePassword(
    @Req() req: IRequest,
    @Body() body: { contrasena_actual: string; nueva_contrasena: string; confirmar_nueva_contrasena: string }
  ): Promise<{ message: string }> {
    const userId = req.user['sub']; // El ID del usuario se obtiene de 'sub'
    
    // Verificar que las contraseñas coincidan
    if (body.nueva_contrasena !== body.confirmar_nueva_contrasena) {
      throw new ConflictException('Las nuevas contraseñas no coinciden');
    }

    return this.adminService.updatePassword(userId, body.contrasena_actual, body.nueva_contrasena);
  }

  // Ruta para actualizar detalles del administrador (si es necesario)
  @UseGuards(JwtAuthGuard) // Usar guardia JWT para proteger la ruta
  @Put('update/:userId')
  async updateAdmin(
    @Param('userId') userId: string,
    @Body() adminDto: adminDto,
  ): Promise<User> {
    try {
      const updatedAdmin = await this.adminService.updateAdmin(userId, adminDto);
      if (!updatedAdmin) {
        throw new NotFoundException('Administrador no encontrado');
      }
      return updatedAdmin;
    } catch (error) {
      throw error;
    }
  }
}
