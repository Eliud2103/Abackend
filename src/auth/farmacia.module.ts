import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FarmaciaController } from './farmacia.controller';
import { FarmaciaService } from './farmacia.service';
import { Farmacia, FarmaciaSchema } from './schemas/farmacia.schema';  // Importación correcta

@Module({
  imports: [MongooseModule.forFeature([{ name: Farmacia.name, schema: FarmaciaSchema }])], // Asegúrate de que el nombre y el esquema coincidan
  controllers: [FarmaciaController],
  providers: [FarmaciaService],
  exports: [FarmaciaService],
})
export class FarmaciaModule {}
