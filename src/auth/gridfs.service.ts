import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class GridFSService {
  private gridFSBucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.gridFSBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'uploads',
    });
  }

  // ✅ Subir archivo a GridFS
  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.gridFSBucket.openUploadStream(file.originalname, {
        contentType: file.mimetype, // Guarda el tipo MIME correcto
      });

      uploadStream.end(file.buffer);

      uploadStream.on('finish', () => {
        const fileId = uploadStream.id.toString();
        resolve(fileId); // Devuelve solo el ID
      });

      uploadStream.on('error', reject);
    });
  }

  // ✅ Obtener el archivo como stream
  async getFile(fileId: string): Promise<{ stream: Readable; contentType: string }> {
    const objectId = new ObjectId(fileId);
    const fileCursor = this.gridFSBucket.find({ _id: objectId });

    const files = await fileCursor.toArray();
    if (!files || files.length === 0) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const file = files[0];
    return {
      stream: this.gridFSBucket.openDownloadStream(objectId),
      contentType: file.contentType || 'application/octet-stream', // Tipo MIME seguro
    };
  }
}
