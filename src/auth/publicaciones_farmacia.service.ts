import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PublicacionFarmacia, PublicacionSchema } from './schemas/publicacion-far.schema'; // Asegúrate de importar el esquema correcto
import { GridFSBucket, ObjectId } from 'mongodb';
import { CreatePublicacionDto } from './dto/create-publicacion-far.dto';

@Injectable()
export class PublicacionesFarmaciaService {
  private bucket: GridFSBucket;

  constructor(
    @InjectModel(PublicacionFarmacia.name) private publicacionFarmaciaModel: Model<PublicacionFarmacia>,

    @InjectConnection() private connection: Connection, // Inyectamos la conexión a MongoDB
  ) {
    this.bucket = new GridFSBucket(this.connection.db, { bucketName: 'uploads' });
  }

  // ✅ Subir imagen para publicación de farmacia
  async subirImagen(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(file.originalname);
      uploadStream.end(file.buffer);  // Subimos el archivo

      uploadStream.on('finish', () => {
        resolve(uploadStream.id.toString()); // Retorna el ID de la imagen subida
      });

      uploadStream.on('error', (error) => {
        reject(new InternalServerErrorException(`Error al subir la imagen: ${error.message}`));
      });
    });
  }

  // ✅ Crear una nueva publicación para farmacia
  async crearPublicacion(publicacionDto: CreatePublicacionDto): Promise<PublicacionFarmacia> {
    try {
      // Asegúrate de que el DTO contenga la imagen
      if (!publicacionDto.img) {
        throw new InternalServerErrorException('La publicación debe tener una imagen.');
      }
      const nuevaPublicacion = new this.publicacionFarmaciaModel(publicacionDto);
      return await nuevaPublicacion.save();  // Guarda la nueva publicación
    } catch (error) {
      console.error('Error al crear publicación de farmacia:', error);
      throw new InternalServerErrorException(`Hubo un error al crear la publicación de farmacia: ${error.message}`);
    }
  }

  async obtenerTodas(): Promise<PublicacionFarmacia[]> {
    try {
      return await this.publicacionFarmaciaModel.find().exec();  // Filtra solo farmacias
    } catch (error) {
      console.error('Error al obtener publicaciones de farmacia:', error);
      throw new InternalServerErrorException(`Hubo un error al obtener las publicaciones de farmacia: ${error.message}`);
    }
  }
  
  // ✅ Obtener una publicación de farmacia por ID
  async obtenerPorId(id: string): Promise<PublicacionFarmacia | null> {
    try {
      const objectId = new ObjectId(id);  // Convertir a ObjectId
      const publicacion = await this.publicacionFarmaciaModel.findOne({ _id: objectId }).exec();  // Buscamos por ID convertido a ObjectId
      
      if (!publicacion) {
        throw new InternalServerErrorException('Publicación no encontrada');
      }
      return publicacion;
    } catch (error) {
      console.error('Error al obtener la publicación de farmacia:', error);
      throw new InternalServerErrorException(`Hubo un error al obtener la publicación de farmacia: ${error.message}`);
    }
  }

  // ✅ Obtener imagen desde GridFS por ID
  async obtenerImagenPorId(fileId: string): Promise<Buffer | null> {
    try {
      const objectId = new ObjectId(fileId);
      const downloadStream = this.bucket.openDownloadStream(objectId);

      return new Promise((resolve, reject) => {
        let data = Buffer.alloc(0);

        downloadStream.on('data', (chunk) => {
          data = Buffer.concat([data, chunk]);
        });

        downloadStream.on('end', () => {
          resolve(data);  // Devuelve el contenido de la imagen
        });

        downloadStream.on('error', (error) => {
          reject(new InternalServerErrorException(`Error al obtener la imagen: ${error.message}`));
        });
      });
    } catch (error) {
      console.error('Error al obtener la imagen:', error);
      throw new InternalServerErrorException(`Hubo un error al obtener la imagen: ${error.message}`);
    }
  }

  // Método para obtener la conexión a MongoDB (si es necesario)
  getMongoDbConnection(): Connection {
    return this.connection;
  }
  async eliminarPublicacion(id: string): Promise<void> {
    try {
      console.log('ID recibido:', id);
  
      if (!ObjectId.isValid(id)) {
        throw new InternalServerErrorException('ID de publicación no válido');
      }
  
      const objectId = new ObjectId(id);  // Convertir el ID a ObjectId
      console.log('ObjectId convertido:', objectId);
  
      const publicacion = await this.publicacionFarmaciaModel.findOne({ _id: objectId }).exec();
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
      await this.publicacionFarmaciaModel.deleteOne({ _id: objectId }).exec();
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      throw new InternalServerErrorException(`Hubo un error al eliminar la publicación: ${error.message}`);
    }
  }

  private async eliminarImagenDeGridFS(fileId: ObjectId): Promise<void> {
    try {
      await this.bucket.delete(fileId, { timeoutMS: 3000 });
    } catch (err) {
      throw new InternalServerErrorException(`Error al eliminar la imagen: ${(err as Error).message}`);
    }
  }
  
}
