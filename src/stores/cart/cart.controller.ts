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
import { CartService } from './cart.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { StoreGuard } from '../guards/store.guard';

@Controller('store/:storeId/cart')
@UseGuards(StoreGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/create')
  async createCart(@Req() request, @Body() createCartDto: AddToCartDto) {
    const storeDbUrl = request['storeDbUrl'];
    const userId = request['userId']; // Extracted from StoreGuard
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

    const storeDbUrl = request['storeDbUrl'];
    return this.cartService.updateCart(storeDbUrl, parsedId, updateCartDto);
  }

  @Get('/all')
  async getAllCarts(@Req() request) {
    const storeDbUrl = request['storeDbUrl'];
    const userId = request['userId']; // Extracted from StoreGuard
    return this.cartService.getAllCarts(storeDbUrl, userId);
  }

  @Get('/:id')
  async getCart(@Req() request: Request, @Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid cart ID');
    }

    const storeDbUrl = request['storeDbUrl'];
    return this.cartService.getCart(storeDbUrl, parsedId);
  }

  @Delete('/:id/delete')
  async deleteCart(@Req() request: Request, @Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid cart ID');
    }

    const storeDbUrl = request['storeDbUrl'];
    return this.cartService.deleteCart(storeDbUrl, parsedId);
  }
}
