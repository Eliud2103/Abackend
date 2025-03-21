import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Publicacion, PublicacionSchema } from './schemas/publicacion-far.schema'; // Asegúrate de importar el esquema correcto
import { GridFSBucket, ObjectId } from 'mongodb';
import { CreatePublicacionDto } from './dto/create-publicacion-far.dto';

@Injectable()
export class PublicacionesFarmaciaService {
  private bucket: GridFSBucket;

  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionFarmaciaModel: Model<Publicacion>,

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
  async crearPublicacion(publicacionDto: CreatePublicacionDto): Promise<Publicacion> {
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

  async obtenerTodas(): Promise<Publicacion[]> {
    try {
      return await this.publicacionFarmaciaModel.find({ categoria: 'farmacia' }).exec();  // Filtra solo farmacias
    } catch (error) {
      console.error('Error al obtener publicaciones de farmacia:', error);
      throw new InternalServerErrorException(`Hubo un error al obtener las publicaciones de farmacia: ${error.message}`);
    }
  }
  
  // ✅ Obtener una publicación de farmacia por ID
  async obtenerPorId(id: string): Promise<Publicacion | null> {
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
}
