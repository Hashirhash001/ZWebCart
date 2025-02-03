import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
