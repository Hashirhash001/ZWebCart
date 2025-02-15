import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthDto } from './dto/create-google-auth.dto';

@Controller('auth')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post('google')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async googleLogin(@Body() googleAuthDto: GoogleAuthDto) {
    return this.googleAuthService.googleAuth(googleAuthDto.token);
  }
}
