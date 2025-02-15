import { PrismaDynamicService } from '../../../prisma/prisma.service';
import { CreateThemeDto } from './dtos/create-theme.dto';
import { UpdateThemeDto } from './dtos/update-theme.dto';
export declare class ThemesService {
    private readonly prismaDynamicService;
    constructor(prismaDynamicService: PrismaDynamicService);
    createTheme(storeDbUrl: string, storeId: string, data: CreateThemeDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            currentVersion: number;
            templateUrl: string | null;
            isActive: boolean;
        };
    }>;
    getThemes(storeDbUrl: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            currentVersion: number;
            templateUrl: string | null;
            isActive: boolean;
        }[];
    }>;
    getTheme(storeDbUrl: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            currentVersion: number;
            templateUrl: string | null;
            isActive: boolean;
        };
    }>;
    updateTheme(storeDbUrl: string, id: string, data: UpdateThemeDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            currentVersion: number;
            templateUrl: string | null;
            isActive: boolean;
        };
    }>;
    deleteTheme(storeDbUrl: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
