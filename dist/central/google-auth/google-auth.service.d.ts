import { JwtService } from '@nestjs/jwt';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
export declare class GoogleAuthService {
    private prisma;
    private jwtService;
    private client;
    constructor(prisma: PrismaCentralService, jwtService: JwtService);
    googleAuth(googleToken: string): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            user: {
                stores: {
                    id: string;
                    name: string;
                    dbName: string;
                    dbUrl: string;
                    storeUrl: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                }[];
            } & {
                email: string;
                password: string | null;
                id: string;
                name: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                role: import("prisma/generated-central").$Enums.Role;
                googleId: string | null;
                provider: string;
                avatarUrl: string | null;
            };
        };
    }>;
}
