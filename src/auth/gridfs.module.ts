import { Module } from '@nestjs/common';
import { GridFSService } from './gridfs.service';

@Module({
  providers: [GridFSService],
  exports: [GridFSService]  // Asegúrate de exportarlo para que esté disponible en otros módulos
})
export class GridFSModule {}
