import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'; // Importamos jsonwebtoken
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Registro de usuario
  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('El correo ya está en uso.');
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar el usuario en la base de datos
    const user = new this.userModel({ ...registerDto, password: hashedPassword });
    return user.save();
  }

  // Iniciar sesión
  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Crear el token JWT
    const payload = { fullName: user.fullName, email: user.email, sub: user._id };
    const accessToken = jwt.sign(payload, 'secreto', { expiresIn: '1h' });

    return { accessToken };
  }

  // Método para actualizar la contraseña
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hashear la nueva contraseña y guardar
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = new Date();
    await user.save(); // Asegurar que se guarde correctamente

    return { message: 'Contraseña actualizada correctamente' };
}

 
}
