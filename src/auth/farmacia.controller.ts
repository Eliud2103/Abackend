import { Controller, Post, Body } from '@nestjs/common';
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
}
