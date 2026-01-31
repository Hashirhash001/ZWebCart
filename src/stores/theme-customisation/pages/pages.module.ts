import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { PrismaDynamicService } from '../../../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaCentralService } from 'src/prisma/prisma-central.service';

@Module({
  imports: [
    JwtModule.register({
        secret: process.env.JWT_SECRET , // Ensure this is the same secret as in AuthModule
        signOptions: { expiresIn: '7d' }, // Token expiry, ensure consistency
    }),
  ],
  controllers: [PagesController],
  providers: [PagesService, PrismaDynamicService, PrismaCentralService],
})
export class PagesModule {}