import { Controller, Post, Body } from '@nestjs/common';
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
}
