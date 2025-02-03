import { ProductsService } from './products.service';
import { Request } from 'express';
import { FilterProductDto } from './dtos/filter-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    private validateDto;
    private parseAndValidateBody;
    createProduct(request: Request, body: any, files: File[]): Promise<{
        success: boolean;
        message: string;
        data: {
            attributes: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                key: string;
                value: string;
                productId: number;
            }[];
            images: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                productId: number;
                url: string;
                isPrimary: boolean;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            categoryId: number;
            price: number;
            comparePrice: number | null;
            stock: number;
        };
    }>;
    updateProduct(request: Request, id: string, body: any, files: File[]): Promise<{
        success: boolean;
        message: string;
        data: {
            attributes: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                key: string;
                value: string;
                productId: number;
            }[];
            images: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                productId: number;
                url: string;
                isPrimary: boolean;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            categoryId: number;
            price: number;
            comparePrice: number | null;
            stock: number;
        };
    }>;
    getAllProducts(request: Request): Promise<{
        success: boolean;
        message: string;
        data: ({
            attributes: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                key: string;
                value: string;
                productId: number;
            }[];
            images: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                productId: number;
                url: string;
                isPrimary: boolean;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            categoryId: number;
            price: number;
            comparePrice: number | null;
            stock: number;
        })[];
    }>;
    getProduct(request: Request, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            attributes: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                key: string;
                value: string;
                productId: number;
            }[];
            images: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                productId: number;
                url: string;
                isPrimary: boolean;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            categoryId: number;
            price: number;
            comparePrice: number | null;
            stock: number;
        };
    }>;
    deleteProduct(request: Request, id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    fetchProductsByCategory(request: Request, categoryId: string): Promise<{
        success: boolean;
        message: string;
        data: ({
            attributes: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                key: string;
                value: string;
                productId: number;
            }[];
            images: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                productId: number;
                url: string;
                isPrimary: boolean;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            categoryId: number;
            price: number;
            comparePrice: number | null;
            stock: number;
        })[];
    }>;
    filterProducts(filterDto: FilterProductDto, request: Request): Promise<{
        success: boolean;
        message: string;
        data: ({
            attributes: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                key: string;
                value: string;
                productId: number;
            }[];
            images: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                productId: number;
                url: string;
                isPrimary: boolean;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            categoryId: number;
            price: number;
            comparePrice: number | null;
            stock: number;
        })[];
    }>;
}
