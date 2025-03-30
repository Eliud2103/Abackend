import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { HospitalModule } from './auth/hospital.module';
import { FarmaciaModule } from './auth/farmacia.module';
import { PublicacionesModule } from './auth/publicaciones.module';
import { PublicacionesFarmaciaModule  } from './auth/publicaciones_farmacia.module';

import { ServeStaticModule } from '@nestjs/serve-static'; // Importar ServeStaticModule
import { join } from 'path'; // Para obtener la ruta correcta de los archivos

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://kevingrst:IY5qcYxMVtVAdiha@ateneadbcluster.51nyt.mongodb.net/atenea?retryWrites=true&w=majority&appName=ateneaDBcluster'),

    AuthModule,
    HospitalModule,
    FarmaciaModule,
    PublicacionesModule,
    PublicacionesFarmaciaModule,


    // Configuración para servir archivos estáticos
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Ruta de los archivos estáticos
      serveRoot: '/file', // Prefijo de la URL para acceder a los archivos
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
