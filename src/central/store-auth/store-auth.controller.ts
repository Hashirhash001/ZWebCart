import { Controller, Post, Body } from '@nestjs/common';
import { RegisterStoreDto } from './dtos/register-store.dto';
import { LoginStoreDto } from './dtos/login-store.dto';
import { StoreAuthService } from './store-auth.service';

@Controller('central/auth')
export class StoreAuthController {
  constructor(private readonly authService: StoreAuthService) {}

  @Post('register')
  async register(@Body() registerStoreDto: RegisterStoreDto) {
    return this.authService.registerStore(registerStoreDto);
  }

  @Post('login')
  async login(@Body() loginStoreDto: LoginStoreDto) {
    return this.authService.loginStore(loginStoreDto);
  }
}
