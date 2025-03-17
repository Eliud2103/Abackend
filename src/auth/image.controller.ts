import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { Response } from 'express';
import * as multer from 'multer';

@Controller('images') // 👈 Asegúrate de que el prefijo sea 'images'
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    try {
      const uploadedFile = await this.imageService.uploadImage(file.buffer, file.originalname);
      return res.json({ fileUrl: `http://localhost:3000/images/file/${uploadedFile.id}` }); // 🔥 Ajustar la URL correcta
    } catch (error) {
      return res.status(500).send('Error uploading image');
    }
  }

  @Get('file/:id')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const downloadStream = await this.imageService.getImageById(id);
    if (!downloadStream) {
      return res.status(404).send('Image not found');
    }
    res.setHeader('Content-Type', 'image/png'); // Ajusta según el tipo de imagen
    downloadStream.pipe(res); // 🔥 Manda la imagen al frontend
  }
}
