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
  // ✅ Método para eliminar una publicación
  // Método para eliminar una publicación
   // Método para eliminar una publicación
   // ✅ Método para eliminar una publicación
   async eliminarPublicacion(id: string): Promise<void> {
    try {
      console.log('ID recibido:', id);
  
      if (!ObjectId.isValid(id)) {
        throw new InternalServerErrorException('ID de publicación no válido');
      }
  
      const objectId = new ObjectId(id);  // Convertir el ID a ObjectId
      console.log('ObjectId convertido:', objectId);
  
      const publicacion = await this.publicacionModel.findOne({ _id: objectId }).exec();
      if (!publicacion) {
        throw new InternalServerErrorException('Publicación no encontrada');
      }
  
      // Si la publicación tiene una URL de imagen, la eliminamos de GridFS
      if (publicacion.img) {
        // Extraer el fileId de la URL de la imagen (suponemos que está en formato http://localhost:3000/publicaciones/imagen/{fileId})
        const urlParts = publicacion.img.split('/');
        const fileId = urlParts[urlParts.length - 1]; // Obtener el último segmento de la URL
  
        // Verificar si el fileId es válido
        if (ObjectId.isValid(fileId)) {
          await this.eliminarImagenDeGridFS(new ObjectId(fileId)); // Eliminar la imagen de GridFS
        } else {
          console.log('El fileId extraído no es válido:', fileId);
        }
      }
  
      // Eliminar la publicación de la base de datos
      await this.publicacionModel.deleteOne({ _id: objectId }).exec();
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      throw new InternalServerErrorException(`Hubo un error al eliminar la publicación: ${error.message}`);
    }
  }
  


  // Método para eliminar la imagen de GridFS
  private async eliminarImagenDeGridFS(fileId: ObjectId): Promise<void> {
    try {
      await this.bucket.delete(fileId, { timeoutMS: 3000 });
    } catch (err) {
      throw new InternalServerErrorException(`Error al eliminar la imagen: ${(err as Error).message}`);
    }
  }
  
}
