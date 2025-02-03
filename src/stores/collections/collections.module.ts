import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { PrismaCentralService } from 'src/prisma/prisma-central.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET , // Ensure this is the same secret as in AuthModule
      signOptions: { expiresIn: '7d' }, // Token expiry, ensure consistency
    }),
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService, PrismaDynamicService, PrismaCentralService],
})
export class CollectionsModule {}
