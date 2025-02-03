import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Request } from 'express';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    createCategory(request: Request, createCategoryDto: CreateCategoryDto): Promise<{
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
    getCategoryHierarchy(request: Request): Promise<{
        success: boolean;
        message: string;
        data: any[];
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    deleteCategory(request: Request, categoryId: number): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
}
