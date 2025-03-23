import { Controller, Post, Body, Get, Param, Patch, Query } from '@nestjs/common';
import { HospitalService } from '../auth/hospital.service';
import { RegisterHospitalDto } from './dto/register-hospital.dto';
import { Hospital } from './schemas/hospital.schema';

@Controller('hospital')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post('register')
  async registerHospital(@Body() registerHospitalDto: RegisterHospitalDto): Promise<Hospital> {
    return this.hospitalService.registerHospital(registerHospitalDto);
  }

  @Get('mostrar')
  async getHospitales(): Promise<Hospital[]> {
    return this.hospitalService.findAll(); // Asegúrate de que esta función existe en el servicio
  }
  @Get('buscar')
  async buscarHospital(@Query('tipo') tipo: string) {
    // Verifica que el tipo esté presente
    if (!tipo) {
      throw new Error('El parámetro tipo es obligatorio.');
    }
  
    // Llama al servicio para realizar la búsqueda
    return this.hospitalService.findByTipoHospital(tipo);
  }
  

  @Get(':id')  // Ruta para obtener hospital por id
  async getHospitalDetails(@Param('id') id: string): Promise<Hospital> {
    return this.hospitalService.findOne(id);
  }

  @Patch(':id/rating')
  updateHospitalRating(@Param('id') id: string, @Body('rating') rating: number) {
    return this.hospitalService.updateRating(id, rating);
  }

  @Post(':id/comentarios')
  async addComment(@Param('id') id: string, @Body('comentario') comentario: string): Promise<Hospital> {
    return this.hospitalService.addComment(id, comentario, 'Anónimo'); // Puedes personalizar el usuario o usar el usuario autenticado
  }

 

  

}
