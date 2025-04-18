import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  lastNameFather: string;

  @IsNotEmpty()
  lastNameMother: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
  @IsNotEmpty()
  role: string;
}
