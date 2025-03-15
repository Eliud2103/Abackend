import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterHospitalDto } from './dto/register-hospital.dto';
import { Hospital } from './schemas/hospital.schema';  // Importamos el esquema de Hospital que ya incluye Responsable
import * as bcrypt from 'bcrypt';

const logger = new Logger('HospitalService'); // Logger de NestJS

@Injectable()
export class HospitalService {
  constructor(
    @InjectModel(Hospital.name) private readonly hospitalModel: Model<Hospital> // Solo inyectamos el modelo de Hospital
  ) {}
  async findHospitalByEmail(email: string): Promise<Hospital | null> {
    return this.hospitalModel.findOne({ "responsable.email_responsable": email }).exec();
  }
  

  async registerHospital(hospitalDto: RegisterHospitalDto): Promise<Hospital> {
    try {
      logger.log('Registrando hospital con los siguientes datos:', hospitalDto);
       // Verificar si el correo ya existe
    const existingHospital = await this.hospitalModel.findOne({ email_hospital: hospitalDto.email_hospital }).exec();
    if (existingHospital) {
      throw new Error('El correo ya está en uso');
    }


      // Creamos el objeto responsable directamente como parte del hospital
      const responsable = {
        nombre_responsable: hospitalDto.nombre_responsable,
        apellido_paterno_responsable: hospitalDto.apellido_paterno_responsable,
        apellido_materno_responsable: hospitalDto.apellido_materno_responsable,
        email_responsable: hospitalDto.email_responsable,
        telefono_responsable: hospitalDto.telefono_responsable,
        password: await this.hashPassword(hospitalDto.password),  // Ciframos la contraseña
      };

      // Creamos el nuevo hospital y asignamos el responsable
      const newHospital = new this.hospitalModel({
        ...hospitalDto,
        responsable, // Asignamos el subdocumento responsable directamente
      });
      
    logger.log('Intentando guardar en MongoDB:', JSON.stringify(newHospital));
    const savedHospital = await newHospital.save();

      logger.log('Hospital creado:', newHospital);
      return await newHospital.save();  // Guardamos el hospital con el responsable
    } catch (error) {
      logger.error('Error al registrar hospital:', error);
      throw new Error('Error al registrar el hospital');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new Error('La contraseña no puede estar vacía');
    }
  
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
  
}
