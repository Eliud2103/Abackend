import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller'; // Asegúrate de crear este controlador
import { AdminService } from './admin.service'; // Asegúrate de crear este servicio
import { User, UserSchema } from '../auth/schemas/user.schema'; // Asegúrate de importar tu User schema
import { AuthModule } from '../auth/auth.module'; // Importa el módulo de autenticación si es necesario
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt-strategy'; // Si el admin usa JWT, asegúrate de incluir el JwtStrategy

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Asegúrate de que el esquema de usuario esté disponible
    AuthModule, // Importa el módulo de autenticación si es necesario
    JwtModule.register({
      secret: 'secreto', // Usa variables de entorno en producción
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AdminController], // Controlador de admin
  providers: [
    AdminService,  // Servicio de admin
    JwtStrategy,  // Asegúrate de que el JwtStrategy esté disponible si lo usas
  ],
})
export class AdminModule {}
