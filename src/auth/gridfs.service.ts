import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class GridFSService {
  private gridFSBucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    const db = this.connection.db;
    this.gridFSBucket = new GridFSBucket(db, {
      bucketName: 'uploads',
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uploadStream = this.gridFSBucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });
    uploadStream.write(file.buffer);
    uploadStream.end();

    return new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        const fileUrl = `http://localhost:3000/file/${uploadStream.id}`; // URL del archivo cargado
        resolve(fileUrl);
      });
      uploadStream.on('error', reject);
    });
  }

  async getFile(id: string): Promise<any> {
    const fileId = new ObjectId(id);
    return this.gridFSBucket.openDownloadStream(fileId);
  }
}
