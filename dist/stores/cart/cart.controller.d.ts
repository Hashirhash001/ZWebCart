import { Request } from 'express';
import { CartService } from './cart.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    createCart(request: Request, createCartDto: AddToCartDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                productId: number;
                quantity: number;
                cartId: number;
            }[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: number;
        };
    }>;
    updateCart(request: Request, id: string, updateCartDto: UpdateCartItemDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                productId: number;
                quantity: number;
                cartId: number;
            }[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: number;
        };
    }>;
    getCart(request: Request, body: {
        storeId: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                productId: number;
                quantity: number;
                cartId: number;
            }[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: number;
        };
    }>;
    deleteCart(request: Request, id: string, body: {
        storeId: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
