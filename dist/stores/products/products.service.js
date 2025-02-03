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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const prisma_central_service_1 = require("../../prisma/prisma-central.service");
const fs = require("fs");
const path = require("path");
let ProductsService = class ProductsService {
    constructor(prisma, prismaStore) {
        this.prisma = prisma;
        this.prismaStore = prismaStore;
    }
    async createProduct(storeDbUrl, createProductDto, files) {
        const client = this.prismaStore.getClient(storeDbUrl);
        try {
            const parsedPrice = parseFloat(createProductDto.price);
            const parsedComparePrice = createProductDto.comparePrice
                ? parseFloat(createProductDto.comparePrice.toString())
                : null;
            const parsedStock = parseInt(createProductDto.stock.toString(), 10);
            if (isNaN(parsedPrice) || isNaN(parsedStock)) {
                throw new common_1.BadRequestException('Invalid price or stock values');
            }
            const parsedCategoryId = parseInt(createProductDto.categoryId.toString(), 10);
            if (isNaN(parsedCategoryId)) {
                throw new common_1.BadRequestException('Invalid category ID');
            }
            const category = await client.category.findUnique({
                where: { id: parsedCategoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            const product = await client.product.create({
                data: {
                    name: createProductDto.name,
                    description: createProductDto.description,
                    price: parsedPrice,
                    comparePrice: parsedComparePrice,
                    categoryId: parsedCategoryId,
                    stock: parsedStock,
                },
            });
            let attributes = [];
            if (createProductDto.attributes &&
                createProductDto.attributes.length > 0) {
                attributes = await Promise.all(createProductDto.attributes.map((attribute) => client.productAttribute.create({
                    data: {
                        productId: product.id,
                        key: attribute.key,
                        value: attribute.value,
                    },
                })));
            }
            let images = [];
            if (files && files.length > 0) {
                images = await Promise.all(files.map((file, index) => {
                    const imageUrl = this.saveImageToLocal(file, product.id);
                    return client.productImage.create({
                        data: {
                            productId: product.id,
                            url: imageUrl,
                            isPrimary: index === 0,
                        },
                    });
                }));
            }
            const productWithRelations = await client.product.findUnique({
                where: { id: product.id },
                include: {
                    attributes: true,
                    images: true,
                },
            });
            return {
                success: true,
                message: 'Product created successfully',
                data: productWithRelations,
            };
        }
        catch (error) {
            console.error('Error creating product:', error);
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
        }
    }
    async updateProduct(storeDbUrl, productId, updateProductDto, files) {
        const client = this.prismaStore.getClient(storeDbUrl);
        try {
            const existingProduct = await client.product.findUnique({
                where: { id: productId },
            });
            if (!existingProduct) {
                throw new common_1.NotFoundException('Product not found');
            }
            if (updateProductDto.categoryId !== undefined) {
                const category = await client.category.findUnique({
                    where: { id: updateProductDto.categoryId },
                });
                if (!category) {
                    throw new common_1.NotFoundException('Category not found');
                }
            }
            const updatedProduct = await client.product.update({
                where: { id: productId },
                data: {
                    name: updateProductDto.name ?? existingProduct.name,
                    description: updateProductDto.description ?? existingProduct.description,
                    price: updateProductDto.price ?? existingProduct.price,
                    comparePrice: updateProductDto.comparePrice ?? existingProduct.comparePrice,
                    stock: updateProductDto.stock ?? existingProduct.stock,
                    categoryId: updateProductDto.categoryId ?? existingProduct.categoryId,
                },
            });
            if (updateProductDto.attributes) {
                await client.productAttribute.deleteMany({
                    where: { productId },
                });
                await Promise.all(updateProductDto.attributes.map((attribute) => client.productAttribute.create({
                    data: {
                        productId,
                        key: attribute.key,
                        value: attribute.value,
                    },
                })));
            }
            if (files && files.length > 0) {
                await client.productImage.deleteMany({
                    where: { productId },
                });
                await Promise.all(files.map((file, index) => {
                    const imageUrl = this.saveImageToLocal(file, productId);
                    return client.productImage.create({
                        data: {
                            productId,
                            url: imageUrl,
                            isPrimary: index === 0,
                        },
                    });
                }));
            }
            const productWithRelations = await client.product.findUnique({
                where: { id: productId },
                include: {
                    attributes: true,
                    images: true,
                },
            });
            return {
                success: true,
                message: 'Product updated successfully',
                data: productWithRelations,
            };
        }
        catch (error) {
            console.error('Error updating product:', error);
            throw new common_1.InternalServerErrorException(error.message || 'Error updating product');
        }
    }
    saveImageToLocal(file, productId) {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
        try {
            fs.renameSync(file.path, filePath);
            return filePath.replace(/\\/g, '/');
        }
        catch (error) {
            console.error('Error saving image to local storage:', error);
            throw new common_1.BadRequestException('Error saving the image locally');
        }
    }
    async getProducts(storeDbUrl) {
        const client = this.prismaStore.getClient(storeDbUrl);
        try {
            const products = await client.product.findMany({
                include: {
                    attributes: true,
                    images: true,
                },
            });
            if (!products.length) {
                return {
                    success: false,
                    message: 'No products found',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Products fetched successfully',
                data: products,
            };
        }
        catch (error) {
            console.error('Error fetching products:', error);
            throw new common_1.InternalServerErrorException(error.message || 'Error fetching products');
        }
    }
    async getProduct(storeDbUrl, id) {
        const client = this.prismaStore.getClient(storeDbUrl);
        try {
            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId)) {
                return {
                    success: false,
                    message: 'Invalid product ID',
                    data: null,
                };
            }
            const product = await client.product.findUnique({
                where: { id: parsedId },
                include: {
                    attributes: true,
                    images: true,
                },
            });
            if (!product) {
                return {
                    success: false,
                    message: 'Product not found',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Product fetched successfully',
                data: product,
            };
        }
        catch (error) {
            console.error('Error fetching product:', error);
            throw new common_1.InternalServerErrorException(error.message || 'Error fetching product');
        }
    }
    async deleteProduct(storeDbUrl, id) {
        const client = this.prismaStore.getClient(storeDbUrl);
        try {
            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId)) {
                return {
                    success: false,
                    message: 'Invalid product ID',
                    data: null,
                };
            }
            const product = await client.product.findUnique({
                where: { id: parsedId },
            });
            if (!product) {
                return {
                    success: false,
                    message: 'Product not found',
                    data: null,
                };
            }
            await client.productAttribute.deleteMany({
                where: { productId: parsedId },
            });
            await client.productImage.deleteMany({
                where: { productId: parsedId },
            });
            await client.product.delete({
                where: { id: parsedId },
            });
            return {
                success: true,
                message: 'Product deleted successfully',
                data: null,
            };
        }
        catch (error) {
            console.error('Error deleting product:', error);
            throw new common_1.InternalServerErrorException(error.message || 'Error deleting product');
        }
    }
    async filterProductsByCategory(storeDbUrl, categoryId) {
        const client = this.prismaStore.getClient(storeDbUrl);
        try {
            const parsedCategoryId = parseInt(categoryId, 10);
            if (isNaN(parsedCategoryId)) {
                throw new common_1.BadRequestException('Invalid category ID');
            }
            const category = await client.category.findUnique({
                where: { id: parsedCategoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            const descendantCategories = await client.categoryHierarchy.findMany({
                where: { ancestorId: parsedCategoryId },
                select: { descendantId: true },
            });
            const categoryIds = [
                parsedCategoryId,
                ...descendantCategories.map((item) => item.descendantId),
            ];
            const products = await client.product.findMany({
                where: {
                    categoryId: { in: categoryIds },
                },
                include: {
                    attributes: true,
                    images: true,
                },
            });
            if (!products.length) {
                return {
                    success: false,
                    message: 'No products found for the selected category',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Products fetched successfully',
                data: products,
            };
        }
        catch (error) {
            console.error('Error filtering products by category:', error);
            throw new common_1.InternalServerErrorException(error.message || 'Error filtering products');
        }
    }
    async filterProductsByPriceAndAttributes(storeDbUrl, minPrice, maxPrice, attributes = {}) {
        const client = this.prismaStore.getClient(storeDbUrl);
        try {
            if (typeof attributes !== 'object' || attributes === null) {
                attributes = {};
            }
            const where = {};
            if (minPrice !== null) {
                where.price = { gte: minPrice };
            }
            if (maxPrice !== null) {
                where.price = { ...where.price, lte: maxPrice };
            }
            if (Object.keys(attributes).length > 0) {
                where.AND = Object.entries(attributes).map(([key, value]) => ({
                    attributes: {
                        some: {
                            key: key,
                            value: value,
                        },
                    },
                }));
            }
            const products = await client.product.findMany({
                where,
                include: {
                    attributes: true,
                    images: true,
                },
            });
            if (products.length === 0) {
                return {
                    success: false,
                    message: 'No products found with the given filters',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Products fetched successfully',
                data: products,
            };
        }
        catch (error) {
            console.error('Error filtering products by price and attributes:', error);
            throw new common_1.InternalServerErrorException(error.message || 'Error filtering products');
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_central_service_1.PrismaCentralService,
        prisma_service_1.PrismaDynamicService])
], ProductsService);
//# sourceMappingURL=products.service.js.map