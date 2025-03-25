import { Injectable, NotFoundException } from '@nestjs/common';
import { GridFSBucket } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class GridFSService {
  private gridFsBucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.gridFsBucket = new GridFSBucket(this.connection.db, { bucketName: 'uploads' }); // Cambia 'uploads' si usaste otro nombre
  }

  // ✅ Método para obtener un archivo de GridFS y devolver un Stream
  async getFileStream(fileId: string): Promise<Readable> {
    const objectId = new ObjectId(fileId);
    const fileCursor = this.gridFsBucket.find({ _id: objectId });

    const files = await fileCursor.toArray();
    if (!files || files.length === 0) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return this.gridFsBucket.openDownloadStream(objectId);
  }

  // ✅ Método opcional para obtener metadatos del archivo
  async getFileMetadata(fileId: string) {
    const objectId = new ObjectId(fileId);
    const fileCursor = this.gridFsBucket.find({ _id: objectId });
    
    const files = await fileCursor.toArray();
    return files[0] || null;
  }
}
