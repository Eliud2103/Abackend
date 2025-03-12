import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterFarmaciaDto {
  @IsString()
  @IsNotEmpty()
  nombre_responsable: string;

  @IsString()
  @IsNotEmpty()
  apellido_paterno_responsable: string;

  @IsString()
  @IsNotEmpty()
  apellido_materno_responsable: string;

  @IsEmail()
  @IsNotEmpty()
  email_responsable: string;

  @IsString()
  @IsNotEmpty()
  telefono_responsable: string;

  @IsString()
  @IsNotEmpty()
  nombre_farmacia: string;

  @IsString()
  @IsNotEmpty()
  tipo_farmacia: string;

  @IsString()
  @IsNotEmpty()
  numero_licencia_sanitaria: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsEmail()
  @IsNotEmpty()
  email_farmacia: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
