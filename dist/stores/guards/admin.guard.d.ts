import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
export declare class AdminGuard implements CanActivate {
    private jwtService;
    private prismaCentral;
    constructor(jwtService: JwtService, prismaCentral: PrismaCentralService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
