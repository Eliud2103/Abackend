import { Controller, Post, Body, Get, Param } from '@nestjs/common';
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
  @Get(':id')  // Ruta para obtener hospital por id
  async getHospitalDetails(@Param('id') id: string): Promise<Hospital> {
    return this.hospitalService.findOne(id);
  }
}
