import { PrismaDynamicService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
export declare class CategoryService {
    private readonly prisma;
    constructor(prisma: PrismaDynamicService);
    createCategory(storeDbUrl: string, data: CreateCategoryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
        };
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    getCategoryHierarchy(storeDbUrl: string): Promise<{
        success: boolean;
        message: string;
        data: any[];
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    deleteCategory(storeDbUrl: string, id: number): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
}
