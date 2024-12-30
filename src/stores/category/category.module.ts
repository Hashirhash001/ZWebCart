import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaCentralService } from 'src/prisma/prisma-central.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET , // Ensure this is the same secret as in AuthModule
      signOptions: { expiresIn: '1h' }, // Token expiry, ensure consistency
    }),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, PrismaDynamicService, PrismaCentralService],
})
export class CategoryModule {}
