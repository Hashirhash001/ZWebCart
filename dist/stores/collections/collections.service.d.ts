import { PrismaDynamicService } from '../../prisma/prisma.service';
import { CreateCollectionDto, AddProductsToCollectionDto } from './dtos/create-collection.dto';
export declare class CollectionsService {
    private readonly prisma;
    constructor(prisma: PrismaDynamicService);
    createCollection(dto: CreateCollectionDto, storeDbUrl: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getAllCollections(storeDbUrl: string): Promise<{
        success: boolean;
        message: string;
        data: ({
            products: {
                id: number;
                productId: number;
                collectionId: number;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        })[];
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getCollectionById(id: number, storeDbUrl: string): Promise<{
        success: boolean;
        message: string;
        data: {
            products: {
                id: number;
                productId: number;
                collectionId: number;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    addProductsToCollection(collectionId: number, dto: AddProductsToCollectionDto, storeDbUrl: string): Promise<{
        success: boolean;
        message: string;
        data: {
            products: {
                id: number;
                productId: number;
                collectionId: number;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
}
