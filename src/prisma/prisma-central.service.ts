import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated-central';

@Injectable()
export class PrismaCentralService extends PrismaClient {
  constructor() {
    super();
  }
}
