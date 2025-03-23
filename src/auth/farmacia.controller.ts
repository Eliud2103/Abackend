import { Controller, Post, Body, Get, Patch, Param, Query } from '@nestjs/common';
import { FarmaciaService } from './farmacia.service';
import { RegisterFarmaciaDto } from './dto/register-farmacia.dto';
import { Farmacia } from './schemas/farmacia.schema';

@Controller('farmacia')
export class FarmaciaController {
  constructor(private readonly farmaciaService: FarmaciaService) {}

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
