import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaCentralModule } from '../../prisma/prisma-central.module';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';

@Module({
  imports: [
    PrismaCentralModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService],
})
export class GoogleAuthModule {}
