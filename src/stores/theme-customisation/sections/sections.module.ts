import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
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
  providers: [SectionsService, PrismaDynamicService, PrismaCentralService], // Registers services used in this module
  controllers: [SectionsController], // Defines the controller handling routes
})
export class SectionsModule {}