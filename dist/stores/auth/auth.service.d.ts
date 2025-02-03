import { JwtService } from '@nestjs/jwt';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
export declare class AuthService {
    private prismaCentral;
    private prismaDynamic;
    private jwtService;
    constructor(prismaCentral: PrismaCentralService, prismaDynamic: PrismaDynamicService, jwtService: JwtService);
    private getDatabaseUrl;
    login(storeId: string, loginUserDto: LoginUserDto): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            user: {
                email: string;
                password: string;
                id: number;
                role: import("prisma/generated-store").$Enums.Role;
            };
        };
    }>;
    register(storeId: string, registerUserDto: RegisterUserDto): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            user: {
                email: string;
                id: number;
                role: import("prisma/generated-store").$Enums.Role;
            };
        };
    }>;
}
