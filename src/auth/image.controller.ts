import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { Response } from 'express';
import * as multer from 'multer';
import * as path from 'path';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  // Endpoint para subir la imagen
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() })) // Usamos memoria para almacenar la imagen
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    // Guardamos la imagen en el bucket de GridFS
    await this.imageService.uploadImage(file.buffer, file.originalname);

    // Opcional: Guardar los metadatos de la imagen en la base de datos si lo deseas
    await this.imageService.saveImage(file.originalname, file.path);

    return { fileUrl: `http://localhost:3000/images/${file.originalname}` }; // Retorna la URL de la imagen
  }

  // Endpoint para obtener la imagen por su nombre
  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const downloadStream = await this.imageService.getImage(filename);
    downloadStream.pipe(res); // Enviar la imagen como respuesta
  }
}
