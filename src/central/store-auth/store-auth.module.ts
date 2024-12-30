import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaCentralModule } from '../../prisma/prisma-central.module';
import { StoreAuthController } from './store-auth.controller';
import { StoreAuthService } from './store-auth.service';

@Module({
  imports: [
    PrismaCentralModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [StoreAuthController],
  providers: [StoreAuthService],
})
export class StoreAuthModule {}
