import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaCentralService } from 'src/prisma/prisma-central.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Ensure this is the same secret as in AuthModule
      signOptions: { expiresIn: '10h' }, // Token expiry, ensure consistency
    }),
  ],
  controllers: [WishlistController],
  providers: [WishlistService, PrismaDynamicService, PrismaCentralService],
})
export class WishlistModule {}