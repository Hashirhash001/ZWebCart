import { PrismaDynamicService } from '../../prisma/prisma.service';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { File } from 'multer';
export declare class ProductsService {
    private prisma;
    private prismaStore;
    constructor(prisma: PrismaCentralService, prismaStore: PrismaDynamicService);
    createProduct(storeDbUrl: string, createProductDto: CreateProductDto, files: File[]): Promise<{
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
    updateProduct(storeDbUrl: string, productId: number, updateProductDto: UpdateProductDto, files: File[]): Promise<{
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
    saveImageToLocal(file: File, productId: number): string;
    getProducts(storeDbUrl: string): Promise<{
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
    getProduct(storeDbUrl: string, id: string): Promise<{
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
    deleteProduct(storeDbUrl: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    filterProductsByCategory(storeDbUrl: string, categoryId: string): Promise<{
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
    filterProductsByPriceAndAttributes(storeDbUrl: string, minPrice: number | null, maxPrice: number | null, attributes?: Record<string, string>): Promise<{
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
