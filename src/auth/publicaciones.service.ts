import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

@Injectable()
export class PublicacionesService {
  private bucket: GridFSBucket;

  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
    @InjectConnection() private connection: Connection, // 🔹 Inyectamos la conexión a MongoDB
  ) {
    this.bucket = new GridFSBucket(this.connection.db, { bucketName: 'uploads' });
  }

  // ✅ Método para subir una imagen a GridFS y obtener su ID
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

  // ✅ Método para crear una nueva publicación con una imagen
  async crearPublicacion(createPublicacionDto: CreatePublicacionDto): Promise<Publicacion> {
    try {
      const nuevaPublicacion = new this.publicacionModel(createPublicacionDto);
      return await nuevaPublicacion.save(); // Guarda la nueva publicación
    } catch (error) {
      console.error('Error al crear publicación:', error);
      throw new InternalServerErrorException(`Hubo un error al crear la publicación: ${error.message}`);
    }
  }

  // ✅ Método para obtener todas las publicaciones
  async obtenerTodas(): Promise<Publicacion[]> {
    try {
      return await this.publicacionModel.find().exec(); // Recupera todas las publicaciones
    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
      throw new InternalServerErrorException(`Hubo un error al obtener las publicaciones: ${error.message}`);
    }
  }

  // ✅ Método para obtener la conexión a MongoDB
  getMongoDbConnection(): Connection {
    return this.connection;
  }
  async obtenerPorId(id: string): Promise<Publicacion | null> {
    try {
      const objectId = new ObjectId(id);  // Convertir a ObjectId
      return await this.publicacionModel.findOne({ _id: objectId }).exec();
    } catch (error) {
      console.error('Error al obtener la publicación:', error);
      throw new InternalServerErrorException(`Hubo un error al obtener la publicación: ${error.message}`);
    }
  }
  
}
