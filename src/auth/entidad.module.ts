import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Entidad, EntidadSchema } from './schemas/entidad.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Entidad.name, schema: EntidadSchema }]),
  ],
  exports: [MongooseModule], // Exporta para que otros módulos lo usen
})
export class EntidadModule {}
