import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginStoreDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
