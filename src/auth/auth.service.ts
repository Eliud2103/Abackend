import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './schemas/user.schema';
import { Entidad, EntidadDocument } from './schemas/entidad.schema';
import { RegisterDto } from './dto/register.dto';
import { adminDto } from './dto/admin.dto';
import { HospitalService } from './hospital.service'; // Importamos el servicio de hospitales
import { FarmaciaService } from './farmacia.service'; // Importamos el servicio de farmacias
import { RegisterHospitalDto } from './dto/register-hospital.dto';
import { RegisterFarmaciaDto } from './dto/register-farmacia.dto';
import { Types } from 'mongoose';  // Asegúrate de que esto esté presente
2

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Entidad.name) private entidadModel: Model<EntidadDocument>,
    private readonly hospitalService: HospitalService,
    private readonly farmaciaService: FarmaciaService,
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
    const user = new this.userModel({ _id: new Types.ObjectId(),
      role: registerDto.role || 'user',
      ...registerDto, password: hashedPassword });
    return user.save();
  }

  async getUserById(userId: string): Promise<User> {
    return this.userModel.findById(userId).select('-password'); // Excluir la contraseña
  }
  

  async adminRegister(adminDto: adminDto): Promise<User> {
    console.log('Datos recibidos en adminRegister:', adminDto);
    const { email, password } = adminDto;

     // Verificar si el usuario ya existe
     const existingUser = await this.userModel.findOne({ email });
     if (existingUser) {
       throw new ConflictException('El correo ya está en uso.');
     }

      // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

       // Guardar el usuario en la base de datos
       const user = new this.userModel({_id: new Types.ObjectId(), 
         ...adminDto, password: hashedPassword,
            role: adminDto.role || 'admin'  });
       return user.save();
 

  }
  
  

  // Iniciar sesión
  async login(email: string, password: string): Promise<{ accessToken: string; role: string; lastNameFather:string; lastNameMother:string;  fullName: string; email: string }> {
    let user = await this.userModel.findOne({ email });

    if (!user) {
        let role = '';
        let fullName = '';
        let lastNameFather = '';
        let lastNameMother = '';
        let hashedPassword = '';

        // Buscar en hospitales
        const hospital = await this.hospitalService.findHospitalByEmail(email);
        if (hospital) {
            role = 'hospital';
            fullName = `${hospital.responsable.nombre_responsable} ${hospital.responsable.apellido_paterno_responsable}`;
            hashedPassword = hospital.responsable.password; // Asegúrate de que está encriptado en la BD
        }

        // Buscar en farmacias
        const farmacia = await this.farmaciaService.findFarmaciaByEmail(email);
        if (farmacia) {
            role = 'farmacia';
            fullName = `${farmacia.responsable.nombre_responsable} ${farmacia.responsable.apellido_paterno_responsable}`;
            hashedPassword = farmacia.responsable.password; // Asegúrate de que está encriptado en la BD
        }

        if (!role) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Crear un objeto de usuario simulado
        user = { email, fullName,lastNameFather, lastNameMother, role, password: hashedPassword } as any;
        
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Generar el token JWT
    const payload = { fullName: user.fullName, lastNameFather:user.lastNameFather,lastNameMother:user.lastNameMother, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, 'secreto', { expiresIn: '1h' });
    

    return { accessToken, role: user.role,lastNameFather: user.lastNameFather, lastNameMother:user.lastNameMother, fullName: user.fullName, email: user.email };
}

  
  // Método para registrar hospital
  async registerHospital(hospitalDto: RegisterHospitalDto): Promise<any> {
    return this.hospitalService.registerHospital(hospitalDto);
  }

  // Método para registrar farmacia
  async registerFarmacia(farmaciaDto: RegisterFarmaciaDto): Promise<any> {
    return this.farmaciaService.registerFarmacia(farmaciaDto);
  }

  // Método para actualizar la contraseña
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Hey y el id', userId);
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
  