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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CartService = class CartService {
    constructor(prismaDynamicService) {
        this.prismaDynamicService = prismaDynamicService;
    }
    async createCart(storeDbUrl, userId, createCartDto) {
        const client = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const { productId, quantity } = createCartDto;
            if (!productId || !quantity || quantity <= 0) {
                throw new common_1.BadRequestException('Product ID and a valid quantity are required.');
            }
            const product = await client.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                throw new common_1.BadRequestException(`Product with ID ${productId} does not exist.`);
            }
            const existingCart = await client.cart.findUnique({
                where: { userId },
                include: { items: true },
            });
            if (existingCart) {
                const existingItem = existingCart.items.find((item) => item.productId === productId);
                if (existingItem) {
                    const updatedCart = await client.cart.update({
                        where: { id: existingCart.id },
                        data: {
                            items: {
                                update: {
                                    where: { id: existingItem.id },
                                    data: { quantity: existingItem.quantity + quantity },
                                },
                            },
                        },
                        include: { items: true },
                    });
                    return {
                        success: true,
                        message: 'Product quantity updated in the existing cart',
                        data: updatedCart,
                    };
                }
                else {
                    const updatedCart = await client.cart.update({
                        where: { id: existingCart.id },
                        data: {
                            items: {
                                create: {
                                    productId,
                                    quantity,
                                },
                            },
                        },
                        include: { items: true },
                    });
                    return {
                        success: true,
                        message: 'Product added to the existing cart',
                        data: updatedCart,
                    };
                }
            }
            const newCart = await client.cart.create({
                data: {
                    userId,
                    items: {
                        create: {
                            productId,
                            quantity,
                        },
                    },
                },
                include: { items: true },
            });
            return {
                success: true,
                message: 'Cart created successfully',
                data: newCart,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'An error occurred while creating the cart.');
        }
    }
    async updateCart(storeDbUrl, cartId, userId, updateCartDto) {
        const client = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const { productId, quantity } = updateCartDto;
            if (!productId || quantity === undefined) {
                throw new common_1.BadRequestException('Product ID and quantity are required.');
            }
            if (quantity <= 0) {
                throw new common_1.BadRequestException('Quantity must be greater than zero.');
            }
            const product = await client.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                throw new common_1.BadRequestException(`Product with ID ${productId} does not exist.`);
            }
            const cart = await client.cart.findUnique({
                where: { id: cartId },
                include: { items: true },
            });
            if (!cart) {
                throw new common_1.NotFoundException(`Cart with ID ${cartId} not found.`);
            }
            if (cart.userId !== userId) {
                throw new common_1.BadRequestException('You are not authorized to update this cart.');
            }
            const cartItem = cart.items.find((item) => item.productId === productId);
            if (!cartItem) {
                throw new common_1.BadRequestException(`Product with ID ${productId} not found in the cart.`);
            }
            const updatedCart = await client.cart.update({
                where: { id: cartId },
                data: {
                    items: {
                        update: {
                            where: { id: cartItem.id },
                            data: { quantity },
                        },
                    },
                },
                include: { items: true },
            });
            return {
                success: true,
                message: 'Cart updated successfully',
                data: updatedCart,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'An error occurred while updating the cart.');
        }
    }
    async getCart(storeDbUrl, userId) {
        const client = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const cart = await client.cart.findFirst({
                where: { userId },
                include: { items: true },
            });
            if (!cart) {
                throw new common_1.NotFoundException(`Cart for user ID ${userId} not found.`);
            }
            if (cart.userId !== userId) {
                throw new common_1.BadRequestException('You are not authorized to update this cart.');
            }
            return {
                success: true,
                message: 'Cart retrieved successfully',
                data: cart,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'An error occurred while retrieving the cart.');
        }
    }
    async deleteCart(storeDbUrl, cartId, userId) {
        const client = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const cart = await client.cart.findUnique({
                where: { id: cartId },
                include: { items: true },
            });
            if (!cart) {
                throw new common_1.NotFoundException(`Cart with ID ${cartId} not found.`);
            }
            if (cart.userId !== userId) {
                throw new common_1.BadRequestException('You are not authorized to delete this cart.');
            }
            await client.cartItem.deleteMany({
                where: { cartId },
            });
            await client.cart.delete({
                where: { id: cartId },
            });
            return {
                success: true,
                message: 'Cart and associated items deleted successfully',
                data: null,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'An error occurred while deleting the cart.');
        }
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaDynamicService])
], CartService);
//# sourceMappingURL=cart.service.js.map