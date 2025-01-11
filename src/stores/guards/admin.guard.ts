import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaCentralService } from '../../prisma/prisma-central.service'; // Import for resolving storeDbUrl
import { decrypt } from '../../central/utils/crypto-utils'; 

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prismaCentral: PrismaCentralService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }

    try {
      const decoded = this.jwtService.verify(token);
      // console.log('Decoded JWT:', decoded);

      // Check if the token is expired
      if (decoded.exp < Date.now() / 1000) {
        throw new ForbiddenException('Token is expired');
      }

      // Check if the user is an admin
      // if (decoded.role !== 'ADMIN') {
      //   throw new ForbiddenException('Unauthorized access');
      // }

      const storeId = decoded.store?.id; // Extract the first store's ID

      // console.log('Extracted Store ID:', storeId); // Debugging log

      if (!storeId) {
        throw new ForbiddenException('Store ID is missing in the token');
      }

      const store = await this.prismaCentral.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        throw new ForbiddenException('Store not found');
      }

      // Decrypt the database URL
      const decryptedDbUrl = decrypt(store.dbUrl);

      // Attach storeDbUrl and storeId to the request object
      request['storeId'] = decoded.storeId;
      request['storeDbUrl'] = decryptedDbUrl;
      // console.log('storeDbUrl:', decryptedDbUrl);

      return true; // Allow access if all checks pass
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ForbiddenException('Token is expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new ForbiddenException('Invalid token');
      }

      throw error;
    }
  }
}
