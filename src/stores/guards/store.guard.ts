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
    
    // Get the token from the header
    const token = request.headers['authorization']?.split(' ')[1];
    console.log('Authorization token:', token);

    if (!token) {
      console.error('No token found in the request');
      throw new UnauthorizedException('Authorization token is required');
    }

    try {
      // Decode the token
      const decoded = this.jwtService.verify(token);
      console.log('Decoded token:', decoded);
      
      const storeId = request.params.storeId;
      const userId = decoded.user?.[0]?.id;
      console.log('storeId from params:', storeId);
      console.log('userId from decoded token:', userId);

      // Check if storeId exists in the decoded stores
      if (!storeId || !decoded.stores?.some((store) => store.id === storeId)) {
        console.error('Invalid or unauthorized store:', storeId);
        throw new ForbiddenException('Invalid or unauthorized store');
      }

      // Fetch the store from the database
      const store = await this.prismaCentral.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        console.error('Store not found for storeId:', storeId);
        throw new ForbiddenException('Store not found');
      }

      console.log('Store found:', store);
      
      // Decrypt the database URL
      const decryptedDbUrl = decrypt(store.dbUrl);
      console.log('Decrypted DB URL:', decryptedDbUrl);

      // Attach data to the request
      request['storeDbUrl'] = decryptedDbUrl;
      request['storeId'] = storeId;
      request['userId'] = userId;

      return true;
    } catch (error) {
      console.error('Error during token validation or guard execution:', error);
      if (error.name === 'TokenExpiredError') {
        throw new ForbiddenException('Token is expired');
      }
      throw new ForbiddenException('Invalid token');
    }
  }
}
