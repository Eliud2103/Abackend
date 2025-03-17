import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class MongoService {
  private client: MongoClient;

  constructor() {
    // Elimina la opción 'useUnifiedTopology'
    this.client = new MongoClient('mongodb://localhost:27017');
  }

  async getDb() {
    await this.client.connect();
    return this.client.db('your-database-name');  // Ajusta el nombre de la base de datos
  }
}
