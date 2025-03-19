import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsUrl()
  @IsNotEmpty()
  img: string; // Validación de URL
}
