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
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CollectionsService = class CollectionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCollection(dto, storeDbUrl) {
        try {
            const client = this.prisma.getClient(storeDbUrl);
            const existingCollection = await client.collection.findUnique({ where: { name: dto.name } });
            if (existingCollection) {
                throw new common_1.BadRequestException('Collection name must be unique');
            }
            const collection = await client.collection.create({ data: dto });
            return { success: true, message: 'Collection created successfully', data: collection };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async getAllCollections(storeDbUrl) {
        try {
            const client = this.prisma.getClient(storeDbUrl);
            const collections = await client.collection.findMany({ include: { products: true } });
            return { success: true, message: 'Collections retrieved successfully', data: collections };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async getCollectionById(id, storeDbUrl) {
        try {
            const client = this.prisma.getClient(storeDbUrl);
            const collection = await client.collection.findUnique({ where: { id }, include: { products: true } });
            if (!collection) {
                throw new common_1.NotFoundException('Collection not found');
            }
            return { success: true, message: 'Collection retrieved successfully', data: collection };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async addProductsToCollection(collectionId, dto, storeDbUrl) {
        try {
            const client = this.prisma.getClient(storeDbUrl);
            const collection = await client.collection.findUnique({ where: { id: collectionId } });
            if (!collection) {
                throw new common_1.NotFoundException('Collection not found');
            }
            const existingProducts = await client.product.findMany({ where: { id: { in: dto.productIds } } });
            if (existingProducts.length !== dto.productIds.length) {
                throw new common_1.BadRequestException('Some products not found');
            }
            await client.collectionProduct.createMany({
                data: dto.productIds.map(productId => ({ collectionId, productId })),
                skipDuplicates: true,
            });
            const updatedCollection = await this.getCollectionById(collectionId, storeDbUrl);
            return { success: true, message: 'Products added to collection successfully', data: updatedCollection.data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaDynamicService])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map