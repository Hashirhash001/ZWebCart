"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WishlistService = class WishlistService {
    constructor(prismaDynamicService) {
        this.prismaDynamicService = prismaDynamicService;
    }
    async createWishlist(storeDbUrl, userId, createWishlistDto) {
        const client = this.prismaDynamicService.getClient(storeDbUrl);
        const { productId } = createWishlistDto;
        const product = await client.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.BadRequestException('Product does not exist.');
        }
        const wishlist = await client.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            return client.wishlist.create({
                data: {
                    userId,
                    items: { create: { productId } },
                },
                include: { items: true },
            });
        }
        const existingItem = await client.wishlistItem.findFirst({
            where: { wishlistId: wishlist.id, productId },
        });
        if (existingItem) {
            throw new common_1.BadRequestException('Product is already in the wishlist.');
        }
        return client.wishlist.update({
            where: { id: wishlist.id },
            data: {
                items: { create: { productId } },
            },
            include: { items: true },
        });
    }
    async updateWishlist(storeDbUrl, wishlistId, userId, updateWishlistDto) {
        const client = this.prismaDynamicService.getClient(storeDbUrl);
        const { productId } = updateWishlistDto;
        const wishlist = await client.wishlist.findUnique({
            where: { id: wishlistId },
        });
        if (!wishlist || wishlist.userId !== userId) {
            throw new common_1.NotFoundException('Wishlist not found or unauthorized.');
        }
        const existingItem = await client.wishlistItem.findFirst({
            where: { wishlistId, productId },
        });
        if (!existingItem) {
            throw new common_1.BadRequestException('Product not found in the wishlist.');
        }
        return client.wishlistItem.update({
            where: { id: existingItem.id },
            data: { productId },
        });
    }
    async getWishlist(storeDbUrl, userId) {
        const client = this.prismaDynamicService.getClient(storeDbUrl);
        const wishlist = await client.wishlist.findFirst({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                stock: true,
                                name: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        });
        if (!wishlist) {
            throw new common_1.NotFoundException('Wishlist not found.');
        }
        const itemsWithStockFlags = wishlist.items.map((item) => ({
            ...item,
            outOfStock: item.product.stock <= 0,
        }));
        return {
            success: true,
            message: 'Wishlist retrieved successfully',
            data: { ...wishlist, items: itemsWithStockFlags },
        };
    }
    async deleteWishlist(storeDbUrl, userId, wishlistId) {
        const client = this.prismaDynamicService.getClient(storeDbUrl);
        const wishlist = await client.wishlist.findFirst({
            where: { id: wishlistId, userId },
        });
        if (!wishlist) {
            throw new common_1.NotFoundException('Wishlist not found or unauthorized.');
        }
        await client.wishlistItem.deleteMany({ where: { wishlistId } });
        const result = await client.wishlist.delete({ where: { id: wishlistId } });
        return {
            success: true,
            message: 'Wishlist deleted successfully.',
            data: result,
        };
    }
    async moveToCartFromWishlist(storeDbUrl, userId, productId, quantity = 1) {
        const client = this.prismaDynamicService.getClient(storeDbUrl);
        if (quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than zero.');
        }
        const wishlist = await client.wishlist.findFirst({
            where: { userId },
            include: { items: true },
        });
        if (!wishlist) {
            throw new common_1.NotFoundException('Wishlist not found.');
        }
        const wishlistItem = await client.wishlistItem.findFirst({
            where: { wishlistId: wishlist.id, productId },
            include: {
                product: true,
            },
        });
        if (!wishlistItem) {
            throw new common_1.NotFoundException('Product not found in the wishlist.');
        }
        if (wishlistItem.product.stock <= 0) {
            throw new common_1.BadRequestException('Product is out of stock.');
        }
        const cart = await client.cart.upsert({
            where: { userId },
            update: {},
            create: { userId },
            include: { items: true },
        });
        const existingCartItem = cart.items.find((item) => item.productId === wishlistItem.productId);
        if (existingCartItem) {
            await client.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity },
            });
        }
        else {
            await client.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: wishlistItem.productId,
                    quantity,
                },
            });
        }
        await client.wishlistItem.delete({ where: { id: wishlistItem.id } });
        return {
            success: true,
            message: 'Product moved from wishlist to cart.',
        };
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaDynamicService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map