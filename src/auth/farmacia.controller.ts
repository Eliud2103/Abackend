import { Controller, Post, Body, Get, Patch, Param, Query, UseInterceptors, UploadedFile, Res, NotFoundException, Delete } from '@nestjs/common';
import { FarmaciaService } from './farmacia.service';
import { RegisterFarmaciaDto } from './dto/register-farmacia.dto';
import { Farmacia } from './schemas/farmacia.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { GridFSBucket, ObjectId } from 'mongodb';

@Controller('farmacia')
export class FarmaciaController {
  constructor(private readonly farmaciaService: FarmaciaService) {}



  // ✅ Eliminar un hospital por ID
  @Delete(':id')
  async deleteHospital(@Param('id') id: string): Promise<void> {
    const result = await this.farmaciaService.deleteFarmacia(id);
    if (!result) {
      throw new NotFoundException(`Hospital con ID ${id} no encontrado`);
    }
  }

    @Post('subir-imagen')
    @UseInterceptors(FileInterceptor('file'))
    async subirImagen(@UploadedFile() file: Express.Multer.File) {
      const fileId = await this.farmaciaService.subirImagen(file);
      const imgUrl = `http://localhost:3000/farmacias/imagen/${fileId}`;
      return { url: imgUrl };
    }

    @Get('imagen/:fileId')
    async getImage(@Param('fileId') fileId: string, @Res() res: Response) {
      try {
        const bucket = new GridFSBucket(this.farmaciaService.getMongoDbConnection().db, {
          bucketName: 'uploads',
        });
  
        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
        downloadStream.pipe(res as any);
      } catch (error) {
        throw new NotFoundException('Imagen no encontrada');
      }
    }
  
  

  @Post('register')
  async registerFarmacia(@Body() registerFarmaciaDto: RegisterFarmaciaDto): Promise<Farmacia> {
    return this.farmaciaService.registerFarmacia(registerFarmaciaDto);
  }
  @Get('mostrar')
    async getFarmacias(): Promise<Farmacia[]> {
      return this.farmaciaService.findAll(); // Asegúrate de que esta función existe en el servicio
    }

      @Get('buscar')
      async buscarHospital(@Query('tipo') tipo: string) {
        // Verifica que el tipo esté presente
        if (!tipo) {
          throw new Error('El parámetro tipo es obligatorio.');
        }
      
        // Llama al servicio para realizar la búsqueda
        return this.farmaciaService.findByTipoFarmacia(tipo);
      }
     @Get(':id')  // Ruta para obtener hospital por id
      async getHospitalDetails(@Param('id') id: string): Promise<Farmacia> {
        return this.farmaciaService.findOne(id);
      }
    
      @Patch(':id/rating')
      updateHospitalRating(@Param('id') id: string, @Body('rating') rating: number) {
        return this.farmaciaService.updateRating(id, rating);
      }
    
      @Post(':id/comentarios')
      async addComment(@Param('id') id: string, @Body('comentario') comentario: string): Promise<Farmacia> {
        return this.farmaciaService.addComment(id, comentario, 'Anónimo'); // Puedes personalizar el usuario o usar el usuario autenticado
      }
  
}
