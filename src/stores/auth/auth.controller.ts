import { Controller, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { RegisterUserDto } from './dtos/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(':storeId/login')
  async login(
    @Param('storeId') storeId: string,
    @Body() loginUserDto: LoginUserDto,
  ) {
    return this.authService.login(storeId, loginUserDto);
  }

  @Post(':storeId/register')
  async register(
    @Param('storeId') storeId: string,
    @Body() registerUserDto: RegisterUserDto,
  ) {
    return this.authService.register(storeId, registerUserDto);
  }
}
