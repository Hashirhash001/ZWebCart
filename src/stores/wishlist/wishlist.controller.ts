import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dtos/add-to-wishlist.dto';
import { UpdateWishlistItemDto } from './dtos/update-wishlist-item.dto';
import { StoreGuard } from '../guards/store.guard';

@Controller('wishlist')
@UseGuards(StoreGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('/create')
  async createWishlist(
    @Req() request: Request,
    @Body() createWishlistDto: AddToWishlistDto,
  ) {
    const { storeId } = createWishlistDto; // Extract storeId from the body
    if (!storeId) {
      throw new BadRequestException('Store ID is required in the request body');
    }
    const storeDbUrl = request['storeDbUrl']; // StoreGuard should set storeDbUrl
    const userId = request['userId']; // Extracted from StoreGuard
    return this.wishlistService.createWishlist(
      storeDbUrl,
      userId,
      createWishlistDto,
    );
  }

  @Get('/')
  async getWishlist(@Req() request: Request, @Body('storeId') storeId: string) {
    if (!storeId) {
      throw new BadRequestException('Store ID is required in the request body');
    }
    const storeDbUrl = request['storeDbUrl'];
    const userId = request['userId']; // Extracted from StoreGuard
    return this.wishlistService.getWishlist(storeDbUrl, userId);
  }

  @Delete('/:id/delete')
  async deleteWishlist(
    @Req() request: Request,
    @Param('id') id: string,
    @Body('storeId') storeId: string,
  ) {
    if (!storeId) {
      throw new BadRequestException('Store ID is required in the request body');
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid wishlist ID');
    }

    const storeDbUrl = request['storeDbUrl'];
    const userId = request['userId']; // Extracted directly from the request
    return this.wishlistService.deleteWishlist(storeDbUrl, userId, parsedId);
  }

  @Post('/move-to-cart')
  async moveToCartFromWishlist(
    @Req() request: Request,
    @Body('storeId') storeId: string,
    @Body('productId') productId: number,
    @Body('quantity') quantity: number = 1,
  ) {
    if (!storeId) {
      throw new BadRequestException('Store ID is required in the request body');
    }

    const storeDbUrl = request['storeDbUrl'];
    const userId = request['userId']; // Extracted from StoreGuard
    return this.wishlistService.moveToCartFromWishlist(
      storeDbUrl,
      userId,
      productId,
      quantity,
    );
  }
}
