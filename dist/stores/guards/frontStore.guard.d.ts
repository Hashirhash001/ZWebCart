import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
export declare class FrontStoreGuard implements CanActivate {
    private readonly prismaCentral;
    constructor(prismaCentral: PrismaCentralService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private decryptDatabaseUrl;
}
