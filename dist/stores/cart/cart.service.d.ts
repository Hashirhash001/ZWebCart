import { PrismaDynamicService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
export declare class CartService {
    private readonly prismaDynamicService;
    constructor(prismaDynamicService: PrismaDynamicService);
    createCart(storeDbUrl: string, userId: number, createCartDto: AddToCartDto): Promise<{
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
    updateCart(storeDbUrl: string, cartId: number, userId: number, updateCartDto: UpdateCartItemDto): Promise<{
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
    getCart(storeDbUrl: string, userId: number): Promise<{
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
    deleteCart(storeDbUrl: string, cartId: number, userId: number): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
