import { Injectable, InternalServerErrorException, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { RegisterHospitalDto } from './dto/register-hospital.dto';
import { Hospital } from './schemas/hospital.schema';  // Importamos el esquema de Hospital que ya incluye Responsable
import * as bcrypt from 'bcrypt';
import { GridFSBucket, ObjectId } from 'mongodb';
import { FileInterceptor } from '@nestjs/platform-express';

const logger = new Logger('HospitalService'); // Logger de NestJS

@Injectable()
export class HospitalService {
    private bucket: GridFSBucket;
  constructor(
    @InjectModel(Hospital.name) private readonly hospitalModel: Model<Hospital> ,
    @InjectConnection() private connection: Connection
    // Solo inyectamos el modelo de Hospital
  ) {
    this.bucket = new GridFSBucket(this.connection.db, { bucketName: 'uploads' });
  }

  
  async findHospitalByEmail(email: string): Promise<Hospital | null> {
    return this.hospitalModel.findOne({ "responsable.email_responsable": email }).exec();
  }
  
  // ✅ Método para obtener la conexión a MongoDB
  getMongoDbConnection(): Connection {
    return this.connection;
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
  async getHospitales() {
    return await this.hospitalModel.find().exec();
  }
  async findAll(): Promise<Hospital[]> {
    return this.hospitalModel.find().exec();
  }
  // Método para obtener un hospital por ID
  async findOneById(id: string): Promise<Hospital> {
    return this.hospitalModel.findById(id).exec();
  }
  async findOne(id: string): Promise<Hospital> {
    return this.hospitalModel.findById(id).exec();
  }
  async updateRating(id: string, rating: number) {
    return this.hospitalModel.findByIdAndUpdate(id, { rating }, { new: true });
  }

   // Método para agregar un comentario a un hospital
   async addComment(id: string, comentario: string, usuario: string): Promise<Hospital> {
    // Aquí estamos usando el operador $push para agregar un comentario al array de comentarios
    return this.hospitalModel.findByIdAndUpdate(
      id,
      { $push: { comentarios: { usuario, texto: comentario } } },
      { new: true }
    ).exec();
  }
// HospitalService
async buscarPorTipo(tipo: string): Promise<Hospital[]> {
  return this.hospitalModel.find({ tipo_hospital: tipo }).exec();  // Buscar por tipo_hospital
}
// Servicio en NestJS
async findByTipoHospital(tipo: string) {
  return this.hospitalModel.find({ tipo_hospital: tipo });
}

async subirImagen(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('No se ha subido una imagen'));
      }

      const uploadStream = this.bucket.openUploadStream(file.originalname);
      uploadStream.end(file.buffer); // 🔹 Subimos el archivo

      uploadStream.on('finish', () => {
        resolve(uploadStream.id.toString()); // Retornamos el ID de la imagen
      });

      uploadStream.on('error', (error) => {
        reject(new InternalServerErrorException(`Error al subir la imagen: ${error.message}`));
      });
    });
  }
  async deleteHospital(id: string): Promise<boolean> {
    const result = await this.hospitalModel.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
  
  
}
