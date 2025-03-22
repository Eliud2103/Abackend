import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesFarmaciaService } from './publicaciones_farmacia.service';
import { PublicacionesFarmaciaController } from './publicaciones_farmacia.controller';
import { PublicacionFarmacia, PublicacionSchema } from './schemas/publicacion-far.schema';  // Asegúrate de importar el esquema correcto

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PublicacionFarmacia.name, schema: PublicacionSchema }]),  // Utiliza el nombre correcto del modelo
  ],
  controllers: [PublicacionesFarmaciaController],
  providers: [PublicacionesFarmaciaService],
})
export class PublicacionesFarmaciaModule {}
