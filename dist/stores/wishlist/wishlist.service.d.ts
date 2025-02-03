import { PrismaDynamicService } from '../../prisma/prisma.service';
import { AddToWishlistDto } from './dtos/add-to-wishlist.dto';
import { UpdateWishlistItemDto } from './dtos/update-wishlist-item.dto';
export declare class WishlistService {
    private readonly prismaDynamicService;
    constructor(prismaDynamicService: PrismaDynamicService);
    createWishlist(storeDbUrl: string, userId: number, createWishlistDto: AddToWishlistDto): Promise<{
        items: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            productId: number;
            wishlistId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: number;
    }>;
    updateWishlist(storeDbUrl: string, wishlistId: number, userId: number, updateWishlistDto: UpdateWishlistItemDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        productId: number;
        wishlistId: number;
    }>;
    getWishlist(storeDbUrl: string, userId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                outOfStock: boolean;
                product: {
                    name: string;
                    price: number;
                    stock: number;
                };
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                productId: number;
                wishlistId: number;
            }[];
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: number;
        };
    }>;
    deleteWishlist(storeDbUrl: string, userId: number, wishlistId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: number;
        };
    }>;
    moveToCartFromWishlist(storeDbUrl: string, userId: number, productId: number, quantity?: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
