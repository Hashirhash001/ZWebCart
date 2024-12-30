import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated-store';
import { decrypt } from '../central/utils/crypto-utils'; // Assuming you have the decrypt function in this file

@Injectable()
export class PrismaDynamicService {
  private clients: Map<string, PrismaClient> = new Map();

  getClient(storeDbUrl: string): PrismaClient {

    if (!this.clients.has(storeDbUrl)) {
      const client = new PrismaClient({
        datasources: {
          db: {
            url: storeDbUrl,
          },
        },
      });
      this.clients.set(storeDbUrl, client);
    }
    return this.clients.get(storeDbUrl);
  }
}
