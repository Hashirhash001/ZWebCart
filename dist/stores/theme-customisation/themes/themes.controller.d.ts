import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dtos/create-theme.dto';
import { UpdateThemeDto } from './dtos/update-theme.dto';
import { Request } from 'express';
export declare class ThemesController {
    private readonly themesService;
    constructor(themesService: ThemesService);
    createTheme(request: Request, body: CreateThemeDto): Promise<{
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
    getAllThemes(request: Request): Promise<{
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
    getTheme(request: Request, id: string): Promise<{
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
    updateTheme(request: Request, id: string, body: UpdateThemeDto): Promise<{
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
    deleteTheme(request: Request, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
