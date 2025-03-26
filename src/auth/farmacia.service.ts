import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { RegisterFarmaciaDto } from '../auth/dto/register-farmacia.dto';
import { Farmacia } from './schemas/farmacia.schema';
import { GridFSBucket } from 'mongodb';
import * as bcrypt from 'bcrypt';

const logger = new Logger('FarmaciaService'); // Logger de NestJS

@Injectable()
export class FarmaciaService {
  private bucket: GridFSBucket;
  constructor(
    @InjectModel(Farmacia.name) private readonly farmaciaModel: Model<Farmacia>,
     @InjectConnection() private connection: Connection
  ) {
    this.bucket = new GridFSBucket(this.connection.db, { bucketName: 'uploads' });
  }

  async findFarmaciaByEmail(email: string): Promise<Farmacia | null> {
    return this.farmaciaModel.findOne({ 'responsable.email_responsable': email }).exec();
  }


  getMongoDbConnection(): Connection {
    return this.connection;
  }


  async registerFarmacia(farmaciaDto: RegisterFarmaciaDto): Promise<Farmacia> {
    try {
      logger.log('Registrando farmacia con los siguientes datos:', farmaciaDto);

      // Verificar si el correo de la farmacia ya existe
      const existingFarmacia = await this.farmaciaModel.findOne({ email_farmacia: farmaciaDto.email_farmacia }).exec();
      if (existingFarmacia) {
        throw new Error('El correo ya está en uso');
      }

      // Creamos el objeto responsable
      const responsable = {
        nombre_responsable: farmaciaDto.nombre_responsable,
        apellido_paterno_responsable: farmaciaDto.apellido_paterno_responsable,
        apellido_materno_responsable: farmaciaDto.apellido_materno_responsable,
        email_responsable: farmaciaDto.email_responsable,
        telefono_responsable: farmaciaDto.telefono_responsable,
        password: await this.hashPassword(farmaciaDto.password), // Ciframos la contraseña
      };

      // Creamos el nuevo documento de farmacia con el responsable
      const newFarmacia = new this.farmaciaModel({
        ...farmaciaDto,
        responsable, // Asignamos el subdocumento responsable
      });

      logger.log('Intentando guardar en MongoDB:', JSON.stringify(newFarmacia));
      const savedFarmacia = await newFarmacia.save();

      logger.log('Farmacia creada:', savedFarmacia);
      return savedFarmacia; 
    } catch (error) {
      logger.error('Error al registrar farmacia:', error);
      throw new Error('Error al registrar la farmacia');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async getFarmacias() {
    return await this.farmaciaModel.find().exec();
  }
  async findAll(): Promise<Farmacia[]> {
      return this.farmaciaModel.find().exec();
    }

     // Método para obtener un hospital por ID
      async findOneById(id: string): Promise<Farmacia> {
        return this.farmaciaModel.findById(id).exec();
      }
      async findOne(id: string): Promise<Farmacia> {
        return this.farmaciaModel.findById(id).exec();
      }
      async updateRating(id: string, rating: number) {
        return this.farmaciaModel.findByIdAndUpdate(id, { rating }, { new: true });
      }
    
       // Método para agregar un comentario a un hospital
       async addComment(id: string, comentario: string, usuario: string): Promise<Farmacia> {
        // Aquí estamos usando el operador $push para agregar un comentario al array de comentarios
        return this.farmaciaModel.findByIdAndUpdate(
          id,
          { $push: { comentarios: { usuario, texto: comentario } } },
          { new: true }
        ).exec();
      }
      async findByTipoFarmacia(tipo: string) {
        return this.farmaciaModel.find({ tipo_farmacia: tipo });
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
}
