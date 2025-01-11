import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { PrismaCentralModule } from 'src/prisma/prisma-central.module';
import { PrismaCentralService } from 'src/prisma/prisma-central.service';

@Module({
  imports: [
    PrismaCentralModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '11h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaDynamicService, PrismaCentralService],
})
export class AuthModule {
  constructor() {
    // Log the JWT_SECRET to verify if it's correctly loaded
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
  }
}
