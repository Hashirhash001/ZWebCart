import { Module } from '@nestjs/common';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';
import { PrismaDynamicService } from '../../../prisma/prisma.service';
import { PrismaCentralService } from 'src/prisma/prisma-central.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
        secret: process.env.JWT_SECRET , // Ensure this is the same secret as in AuthModule
        signOptions: { expiresIn: '7d' }, // Token expiry, ensure consistency
    }),
  ],
  controllers: [ThemesController],
  providers: [ThemesService, PrismaDynamicService, PrismaCentralService],
})
export class ThemesModule {}
