import { Module } from '@nestjs/common';
import { PrismaCentralService } from './prisma-central.service';

@Module({
  providers: [PrismaCentralService],
  exports: [PrismaCentralService], // Export to make it available in other modules
})
export class PrismaCentralModule {}
