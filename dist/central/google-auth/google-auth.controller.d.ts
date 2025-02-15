import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthDto } from './dto/create-google-auth.dto';
export declare class GoogleAuthController {
    private readonly googleAuthService;
    constructor(googleAuthService: GoogleAuthService);
    googleLogin(googleAuthDto: GoogleAuthDto): Promise<{
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
