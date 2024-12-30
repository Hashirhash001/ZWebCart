import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

}
