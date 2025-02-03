import { RegisterStoreDto } from './dtos/register-store.dto';
import { LoginStoreDto } from './dtos/login-store.dto';
import { StoreAuthService } from './store-auth.service';
export declare class StoreAuthController {
    private readonly authService;
    constructor(authService: StoreAuthService);
    register(registerStoreDto: RegisterStoreDto): Promise<{
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
    login(loginStoreDto: LoginStoreDto): Promise<{
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
