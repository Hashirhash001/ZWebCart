import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { CreateCollectionDto, AddProductsToCollectionDto } from './dtos/create-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaDynamicService) {}

  async createCollection(dto: CreateCollectionDto, storeDbUrl: string) {
    try {
      const client = this.prisma.getClient(storeDbUrl);
      
      const existingCollection = await client.collection.findUnique({ where: { name: dto.name } });
      if (existingCollection) {
        throw new BadRequestException('Collection name must be unique');
      }

      const collection = await client.collection.create({ data: dto });
      return { success: true, message: 'Collection created successfully', data: collection };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getAllCollections(storeDbUrl: string) {
    try {
      const client = this.prisma.getClient(storeDbUrl);
      const collections = await client.collection.findMany({ include: { products: true } });
      return { success: true, message: 'Collections retrieved successfully', data: collections };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getCollectionById(id: number, storeDbUrl: string) {
    try {
      const client = this.prisma.getClient(storeDbUrl);
      const collection = await client.collection.findUnique({ where: { id }, include: { products: true } });
      if (!collection) {
        throw new NotFoundException('Collection not found');
      }
      return { success: true, message: 'Collection retrieved successfully', data: collection };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async addProductsToCollection(collectionId: number, dto: AddProductsToCollectionDto, storeDbUrl: string) {
    try {
      const client = this.prisma.getClient(storeDbUrl);
      
      const collection = await client.collection.findUnique({ where: { id: collectionId } });
      if (!collection) {
        throw new NotFoundException('Collection not found');
      }
      
      const existingProducts = await client.product.findMany({ where: { id: { in: dto.productIds } } });
      if (existingProducts.length !== dto.productIds.length) {
        throw new BadRequestException('Some products not found');
      }

      await client.collectionProduct.createMany({
        data: dto.productIds.map(productId => ({ collectionId, productId })),
        skipDuplicates: true,
      });

      const updatedCollection = await this.getCollectionById(collectionId, storeDbUrl);
      return { success: true, message: 'Products added to collection successfully', data: updatedCollection.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}