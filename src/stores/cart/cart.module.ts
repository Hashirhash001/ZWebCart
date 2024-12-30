import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaCentralService } from 'src/prisma/prisma-central.service';

@Module({
  imports: [JwtModule],
  controllers: [CartController],
  providers: [CartService, PrismaDynamicService, PrismaCentralService],
})
export class CartModule {}
