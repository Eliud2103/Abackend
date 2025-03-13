import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './schemas/user.schema';
import { Entidad, EntidadDocument } from './schemas/entidad.schema';
import { RegisterDto } from './dto/register.dto';
import { HospitalService } from './hospital.service'; // Importamos el servicio de hospitales
import { FarmaciaService } from './farmacia.service'; // Importamos el servicio de farmacias
import { RegisterHospitalDto } from './dto/register-hospital.dto';
import { RegisterFarmaciaDto } from './dto/register-farmacia.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Entidad.name) private entidadModel: Model<EntidadDocument>,
    private readonly hospitalService: HospitalService ,
    private readonly farmaciaService: FarmaciaService// Inyectamos el servicio de hospitales
  ) {}

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
  async login(email: string, password: string): Promise<{ accessToken: string; role: string; fullName: string; email: string }> {
    // Buscar primero en usuarios
    let user = await this.userModel.findOne({ email });
  
    if (!user) {
      // Si no lo encuentra, buscar en hospitales por el email del responsable
      const hospital = await this.hospitalService.findHospitalByEmail(email);
      if (!hospital) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }
  
      // Simulamos un usuario con los datos del hospital
      user = new this.userModel({
        email: hospital.responsable.email_responsable,
        fullName: `${hospital.responsable.nombre_responsable} ${hospital.responsable.apellido_paterno_responsable}`,
        role: 'hospital',
        password: hospital.responsable.password,
      });
    }
  
    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
  
    // Generar el token JWT
    const payload = { fullName: user.fullName, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, 'secreto', { expiresIn: '1h' });
  
    return { accessToken, role: user.role, fullName: user.fullName, email: user.email };
  }
  
  

  // Método para registrar hospital
  async registerHospital(hospitalDto: RegisterHospitalDto): Promise<any> {
    return this.hospitalService.registerHospital(hospitalDto);
  }
  async registerFarmacia(farmaciaDto: RegisterFarmaciaDto): Promise<any> {
  
    return this.farmaciaService.registerFarmacia(farmaciaDto);
   
    // Verificar si el correo de la farmacia ya está en uso
   /* const { email_responsable } = farmaciaDto;
    const existingFarmacia = await this.entidadModel.findOne({ email_responsable });
    if (existingFarmacia) {
      throw new ConflictException('El correo electrónico ya está en uso.');
    }

    // Crear una nueva farmacia
    const newFarmacia = new this.entidadModel(farmaciaDto);
    return await newFarmacia.save();*/
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
