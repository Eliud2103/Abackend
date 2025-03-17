import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import { ObjectId } from 'mongodb';  // ✅ Importa ObjectId

@Injectable()
export class ImageService {
  private bucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.bucket = new GridFSBucket(this.connection.db, { bucketName: 'images' }); // 💾 Bucket para almacenar imágenes
  }

  async uploadImage(buffer: Buffer, filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const uploadStream = this.bucket.openUploadStream(filename);
      readableStream.pipe(uploadStream);

      uploadStream.on('finish', () => {
        console.log('✅ Imagen guardada con ID:', uploadStream.id);
        resolve(uploadStream); // Retorna el objeto con el `_id`
      });

      uploadStream.on('error', (error) => {
        console.error('❌ Error al subir imagen:', error);
        reject(error);
      });
    });
  }

  getImageById(id: string) {
    try {
      return this.bucket.openDownloadStream(new ObjectId(id)); // ✅ Usa ObjectId directamente
    } catch (error) {
      console.error('❌ Error al obtener imagen:', error);
      return null;
    }
  }
}
