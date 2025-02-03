import { JwtService } from '@nestjs/jwt';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
import { RegisterStoreDto } from './dtos/register-store.dto';
import { LoginStoreDto } from './dtos/login-store.dto';
export declare class StoreAuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaCentralService, jwtService: JwtService);
    private logMessage;
    registerStore(registerStoreDto: RegisterStoreDto): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            user: {
                id: any;
                email: any;
                role: any;
                store: any;
            };
        };
    }>;
    loginStore(loginStoreDto: LoginStoreDto): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            user: {
                id: any;
                email: any;
                role: any;
                stores: any;
            };
        };
    }>;
}
