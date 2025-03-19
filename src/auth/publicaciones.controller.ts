import { Controller, Post, UseInterceptors, UploadedFile, Param, Get, Res, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { Response } from 'express';
import { ObjectId, GridFSBucket } from 'mongodb';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // ✅ Subir imagen a GridFS y devolver la URL
  @Post('subir-imagen')
  @UseInterceptors(FileInterceptor('file'))
  async subirImagen(@UploadedFile() file: Express.Multer.File) {
    const fileId = await this.publicacionesService.subirImagen(file);
    const imgUrl = `http://localhost:3000/publicaciones/imagen/${fileId}`;
    return { url: imgUrl };
  }

  // ✅ Obtener imagen desde GridFS
  @Get('imagen/:fileId')
  async getImage(@Param('fileId') fileId: string, @Res() res: Response) {
    const bucket = new GridFSBucket(this.publicacionesService.getMongoDbConnection().db, {
      bucketName: 'uploads',
    });

    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
    downloadStream.pipe(res);
  }

  // ✅ NUEVO: Crear una publicación
  @Post()
  async crearPublicacion(@Body() publicacionDto: any) {
    return this.publicacionesService.crearPublicacion(publicacionDto);
  }
  @Get()
  async obtenerPublicaciones() {
    return this.publicacionesService.obtenerTodas();  // Llama al servicio para obtener todas las publicaciones
  }
  @Get(':id')
  async obtenerPublicacionPorId(@Param('id') id: string) {
    return this.publicacionesService.obtenerPorId(id);
  }
}
