import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AdminGuard } from '../guards/admin.guard';
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
  providers: [ProductsService, PrismaDynamicService, PrismaCentralService, AdminGuard],
  controllers: [ProductsController],
})
export class ProductsModule {}
