import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
import { decrypt } from '../../central/utils/crypto-utils';

@Injectable()
export class FrontStoreGuard implements CanActivate {
  constructor(private readonly prismaCentral: PrismaCentralService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const storeId = request.body?.storeId; // Safely extract storeId from the body

    if (!storeId || typeof storeId !== 'string') {
      throw new ForbiddenException('Invalid or missing store ID in the request body.');
    }

    const store = await this.prismaCentral.store.findUnique({
      where: { id: String(storeId) },
    });

    if (!store) {
      throw new ForbiddenException('Store not found.');
    }

    const decryptedDbUrl = this.decryptDatabaseUrl(store.dbUrl);

    // Attach data to the request
    request['storeDbUrl'] = decryptedDbUrl;
    request['storeId'] = storeId;

    return true;
  }

  private decryptDatabaseUrl(dbUrl: string): string {
    try {
      return decrypt(dbUrl);
    } catch (error) {
      console.error('Database URL Decryption Failed:', error);
      throw new ForbiddenException('Failed to decrypt database URL.');
    }
  }
}
