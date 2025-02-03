import { Request } from 'express';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dtos/add-to-wishlist.dto';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    createWishlist(request: Request, createWishlistDto: AddToWishlistDto): Promise<{
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
    getWishlist(request: Request, storeId: string): Promise<{
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
    deleteWishlist(request: Request, id: string, storeId: string): Promise<{
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
    moveToCartFromWishlist(request: Request, storeId: string, productId: number, quantity?: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
