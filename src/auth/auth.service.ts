import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';  // Importamos jsonwebtoken
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const {  email, password } = registerDto;

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

  // Método para iniciar sesión
  async login(email: string,password: string): Promise<{ accessToken: string }> {
    // Verificar si el usuario existe
    const user = await this.userModel.findOne({ email});
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Comparar la contraseña con la almacenada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Crear un JWT Token
    const payload = {  fullName: user.fullName, email: user.email, sub: user._id };  // Los datos que quieras incluir en el payload
    const accessToken = jwt.sign(payload, 'secreto', { expiresIn: '1h' });  // La clave secreta y el tiempo de expiración

    return { accessToken };
  }

  // No es necesario este método aquí. El perfil se obtiene usando el JWT en el controller.
  // async getUserProfile(email: string): Promise<User> {
  //   return this.userModel.findOne({ email });
  // }
}
