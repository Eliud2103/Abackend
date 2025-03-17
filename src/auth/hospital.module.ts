// hospital.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HospitalService } from './hospital.service';
import { Hospital, HospitalSchema } from './schemas/hospital.schema';
import { HospitalController } from './hospital.controller';

@Module({
  imports: [ MongooseModule.forFeature([{ name: Hospital.name, schema: HospitalSchema }])],
  controllers:[HospitalController],
  providers: [HospitalService],
  exports: [HospitalService],
})
export class HospitalModule {}
