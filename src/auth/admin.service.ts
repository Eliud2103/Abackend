import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { adminDto } from './dto/admin.dto';
import { AuthService } from './auth.service'; // Inyectamos el servicio de autenticación para reutilizar la lógica

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly authService: AuthService, // Servicio de autenticación ya existente
  ) {}

  // Registro de un nuevo administrador
  async adminRegister(adminDto: adminDto): Promise<User> {
    const { email, password } = adminDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('El correo ya está en uso.');
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo objeto de usuario sin pasar el _id, ya que Mongoose lo genera automáticamente
    const user = new this.userModel({
      ...adminDto,
      password: hashedPassword,
    });

    // Guardar el usuario en la base de datos
    return user.save();
  }

  // Actualizar la contraseña de un administrador
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Administrador no encontrado');
    }

    // Verificar la contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hashear la nueva contraseña y guardar
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = new Date();
    await user.save(); // Aseguramos que la nueva contraseña se guarde correctamente

    return { message: 'Contraseña actualizada correctamente' };
  }

  // Buscar un administrador por su correo electrónico
  async findAdminByEmail(email: string): Promise<User> {
    const admin = await this.userModel.findOne({ email });
    if (!admin) {
      throw new UnauthorizedException('Administrador no encontrado');
    }
    return admin;
  }

  // Método para obtener el perfil de un administrador
  async getProfile(userId: string): Promise<User> {
    const admin = await this.userModel.findById(userId);
    if (!admin) {
      throw new UnauthorizedException('Administrador no encontrado');
    }
    return admin;
  }

  // Método para actualizar los detalles del administrador
  async updateAdmin(userId: string, adminDto: adminDto): Promise<User> {
    const admin = await this.userModel.findById(userId);
    if (!admin) {
      throw new UnauthorizedException('Administrador no encontrado');
    }

    // Actualizar la información del administrador
    admin.fullName = adminDto.fullName || admin.fullName;
    admin.email = adminDto.email || admin.email;
    // Otros campos específicos pueden ser agregados aquí

    // Guardar cambios
    await admin.save();
    return admin;
  }
}
