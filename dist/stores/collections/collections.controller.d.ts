import { CollectionsService } from './collections.service';
import { CreateCollectionDto, AddProductsToCollectionDto } from './dtos/create-collection.dto';
export declare class CollectionsController {
    private readonly collectionsService;
    constructor(collectionsService: CollectionsService);
    createCollection(request: Request, dto: CreateCollectionDto): Promise<{
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
    getAllCollections(request: Request): Promise<{
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
    getCollection(request: Request, id: number): Promise<{
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
    addProducts(request: Request, id: number, dto: AddProductsToCollectionDto): Promise<{
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
