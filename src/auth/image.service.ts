import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image } from './schemas/image.schema';
import { GridFSBucket } from 'mongodb';

@Injectable()
export class ImageService {
  private bucket: GridFSBucket;

  constructor(@InjectModel(Image.name) private imageModel: Model<Image>) {
    // Conexión a MongoDB y configuración de GridFS
    mongoose.connect('mongodb+srv://kevingrst:IY5qcYxMVtVAdiha@ateneadbcluster.51nyt.mongodb.net/atenea?retryWrites=true&w=majority&appName=ateneaDBcluster', {
      dbName: 'atenea',  // Especificar el nombre de la base de datos
    });

    const conn = mongoose.connection;
    conn.once('open', () => {
      // Se crea un bucket de GridFS para almacenar las imágenes
      this.bucket = new GridFSBucket(conn.db, { bucketName: 'images' });
    });
  }

  // Método para obtener el bucket de GridFS
  getBucket() {
    return this.bucket;
  }

  // Método para guardar la imagen en la base de datos de MongoDB
  async saveImage(filename: string, path: string): Promise<Image> {
    const newImage = new this.imageModel({ filename, path });
    return newImage.save(); // Guarda los metadatos en la colección "Image"
  }

  // Método para cargar una imagen al bucket GridFS
  async uploadImage(fileBuffer: Buffer, filename: string) {
    const uploadStream = this.bucket.openUploadStream(filename);
    uploadStream.end(fileBuffer);
    return uploadStream;
  }

  // Método para obtener una imagen del bucket GridFS
  async getImage(filename: string) {
    const downloadStream = this.bucket.openDownloadStreamByName(filename);
    return downloadStream;
  }
}
