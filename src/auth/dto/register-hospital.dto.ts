import { IsString, IsEmail, IsOptional, IsMongoId } from 'class-validator';

export class RegisterHospitalDto {
  // @IsMongoId()
  // userId: string; // Relación con el usuario responsable

  @IsString()
  nombre_hospital: string; // Nombre del hospital

  @IsString()
  tipo_hospital: string; // Tipo de hospital (Público, Privado, etc.)

  @IsString()
  numero_licencia_sanitaria: string; // Número de licencia sanitaria

  @IsString()
  direccion: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsEmail()
  email_hospital: string;

  // Datos del responsable
  @IsString()
  nombre_responsable: string;

  @IsString()
  apellido_paterno_responsable: string;

  @IsString()
  apellido_materno_responsable: string;

  @IsEmail()
  email_responsable: string;

  @IsString()
  telefono_responsable: string;

  @IsString()
  password: string; // Contraseña del responsable

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  @IsOptional()
  img?: string;  // URL de la imagen del hospital
  @IsString()
  @IsOptional()
  mision?: string;  // URL de la imagen del hospital
  @IsString()
  @IsOptional()
  vision?: string;  // URL de la imagen del hospital
}
