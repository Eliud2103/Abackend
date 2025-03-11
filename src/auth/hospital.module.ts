// hospital.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HospitalService } from './hospital.service';
import { Hospital, HospitalSchema } from './schemas/hospital.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Hospital.name, schema: HospitalSchema }])],
  providers: [HospitalService],
  exports: [HospitalService],
})
export class HospitalModule {}
