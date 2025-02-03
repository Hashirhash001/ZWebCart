import { Controller, Post, Get, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto, AddProductsToCollectionDto } from './dtos/create-collection.dto';
import { FrontStoreGuard } from '../guards/frontStore.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('store/collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post('/create')
  @UseGuards(AdminGuard)
  async createCollection(@Req() request: Request, @Body() dto: CreateCollectionDto) {
    const storeDbUrl = request['storeDbUrl']; // Retrieve storeDbUrl from the request
    return this.collectionsService.createCollection(dto, storeDbUrl);
  }

  @Get('/')
  @UseGuards(FrontStoreGuard)
  async getAllCollections(@Req() request: Request) {
    const storeDbUrl = request['storeDbUrl'];
    return this.collectionsService.getAllCollections(storeDbUrl);
  }

  @Get('/:id')
  @UseGuards(FrontStoreGuard)
  async getCollection(@Req() request: Request, @Param('id', ParseIntPipe) id: number) {
    const storeDbUrl = request['storeDbUrl'];
    return this.collectionsService.getCollectionById(id, storeDbUrl);
  }

  @Post('/:id/products')
  @UseGuards(AdminGuard)
  async addProducts(@Req() request: Request, @Param('id', ParseIntPipe) id: number, @Body() dto: AddProductsToCollectionDto) {
    const storeDbUrl = request['storeDbUrl'];
    return this.collectionsService.addProductsToCollection(id, dto, storeDbUrl);
  }
}
