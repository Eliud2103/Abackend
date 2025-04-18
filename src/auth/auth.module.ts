import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt-strategy';
import { AuthController } from './auth.controller';
import { EntidadModule } from '../auth/entidad.module';
import { HospitalModule } from './hospital.module';
import { FarmaciaModule } from './farmacia.module';
import {GridFSModule} from '../auth/gridfs.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema,collection:'usuarios' }]),
    EntidadModule, // Asegura que el EntidadModel está disponible
    HospitalModule,
    GridFSModule,
    FarmaciaModule, // Importa el módulo de Farmacia
    PassportModule,
    
    JwtModule.register({
      secret: 'secreto', // Usa variables de entorno en producción
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
