import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Req,
  UseGuards,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { CartService } from './cart.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { StoreGuard } from '../guards/store.guard';

@Controller('cart') // Removed :storeId from the route
@UseGuards(StoreGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/create')
  async createCart(
    @Req() request: Request,
    @Body() createCartDto: AddToCartDto,
  ) {
    const storeDbUrl = request['storeDbUrl']; // You might map storeId to storeDbUrl in your guard
    const userId = request['userId'];
    return this.cartService.createCart(storeDbUrl, userId, createCartDto);
  }

  @Put('/update/:id')
  async updateCart(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartItemDto,
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid cart ID');
    }

    const storeDbUrl = request['storeDbUrl']; // You might map storeId to storeDbUrl in your guard
    const userId = request['userId'];
    return this.cartService.updateCart(
      storeDbUrl,
      parsedId,
      userId,
      updateCartDto,
    );
  }

  @Get('/')
  async getCart(@Req() request: Request, @Body() body: { storeId: number }) {
    const storeDbUrl = request['storeDbUrl']; // You might map storeId to storeDbUrl in your guard
    const userId = request['userId'];
    return this.cartService.getCart(storeDbUrl, userId);
  }

  @Delete('/:id/delete')
  async deleteCart(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: { storeId: number },
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid cart ID');
    }

    const storeDbUrl = request['storeDbUrl']; // You might map storeId to storeDbUrl in your guard
    const userId = request['userId'];
    return this.cartService.deleteCart(storeDbUrl, userId, parsedId);
  }
}
