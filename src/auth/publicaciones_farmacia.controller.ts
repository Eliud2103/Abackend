import { Controller, Get, Param, Res, HttpStatus, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { Response } from 'express';
import { GridFSBucket, ObjectId } from 'mongodb';
import { PublicacionesFarmaciaService } from './publicaciones_farmacia.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('farmacias/publicaciones')
export class PublicacionesFarmaciaController {
  constructor(private readonly publicacionesFarmaciaService: PublicacionesFarmaciaService) {}


  // ✅ Subir imagen a GridFS y devolver la URL
    @Post('subir-imagen')
    @UseInterceptors(FileInterceptor('file'))
    async subirImagen(@UploadedFile() file: Express.Multer.File) {
      const fileId = await this.publicacionesFarmaciaService.subirImagen(file);
      const imgUrl = `http://localhost:3000/publicaciones/imagen/${fileId}`;
      return { url: imgUrl };
    }

  // ✅ Obtener imagen desde GridFS para publicaciones de farmacias
  // ✅ Obtener imagen desde GridFS
  @Get('imagen/:fileId')
  async getImage(@Param('fileId') fileId: string, @Res() res: Response) {
    const bucket = new GridFSBucket(this.publicacionesFarmaciaService.getMongoDbConnection().db, {
      bucketName: 'uploads',
    });

    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
    downloadStream.pipe(res);
  }
  @Post()
  async crearPublicacion(@Body() publicacionDto: any) {
    publicacionDto.categoria = 'farmacia';  // 👈 Forzar que todas las publicaciones sean de farmacia
    return this.publicacionesFarmaciaService.crearPublicacion(publicacionDto);
  }
  
    @Get()
    async obtenerPublicaciones() {
      return this.publicacionesFarmaciaService.obtenerTodas();  // Llama al servicio para obtener todas las publicaciones
    }
    @Get(':id')
    async obtenerPublicacionPorId(@Param('id') id: string) {
      return this.publicacionesFarmaciaService.obtenerPorId(id);
    }

}
