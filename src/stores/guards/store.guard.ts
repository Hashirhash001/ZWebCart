import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
import { decrypt } from '../../central/utils/crypto-utils';

@Injectable()
export class StoreGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaCentral: PrismaCentralService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }

    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const userId = decoded.sub;
      const storeId = request.body.storeId; // Extract storeId from the request body

      if (!storeId) {
        throw new ForbiddenException('Store ID is required in the request body');
      }

      console.log('Decoded JWT:', decoded);
      console.log('Store ID from body:', storeId);

      const store = await this.prismaCentral.store.findUnique({
        where: { id: String(storeId) },
      });

      if (!store) {
        throw new ForbiddenException('Store not found');
      }

      const decryptedDbUrl = decrypt(store.dbUrl);

      // Attach data to the request
      request['storeDbUrl'] = decryptedDbUrl;
      request['storeId'] = storeId;
      request['userId'] = userId;

      console.log('Attached to Request:', { storeDbUrl: decryptedDbUrl, storeId, userId });

      return true;
    } catch (error) {
      console.error('Error:', error);

      // Check for token-specific errors
      if (error.name === 'TokenExpiredError') {
        throw new ForbiddenException('Token is expired');
      } else if (error.message === 'Store not found') {
        throw new ForbiddenException('Store not found');
      } else if (error.message === 'Store ID is required in the request body') {
        throw new ForbiddenException('Store ID is required in the request body');
      }

      throw new ForbiddenException('Invalid token');
    }
  }
}
