// dto/update-user.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  @IsOptional()
  @IsString()
  readonly lastNameFather?: string;

  @IsOptional()
  @IsString()
  readonly lastNameMother?: string;

  @IsOptional()
  @IsString()
  readonly email?: string;

 // Si también deseas permitir actualizar la contraseña
}
