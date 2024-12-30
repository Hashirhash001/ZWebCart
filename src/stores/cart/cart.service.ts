import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaDynamicService } from '../../prisma/prisma.service'; // Adjust path if necessary
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prismaDynamicService: PrismaDynamicService) {}

  async createCart(
    storeDbUrl: string,
    userId: number,
    createCartDto: AddToCartDto,
  ) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const { productId, quantity } = createCartDto;

      if (!productId || !quantity || quantity <= 0) {
        throw new BadRequestException(
          'Product ID and a valid quantity are required.',
        );
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
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while creating the cart.',
      );
    }
  }

  async updateCart(
    storeDbUrl: string,
    cartId: number,
    updateCartDto: UpdateCartItemDto,
  ) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const { quantity,    } = updateCartDto;

      if (quantity && quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than zero.');
      }

      const cart = await client.cart.findUnique({
        where: { id: cartId },
        include: { items: true },
      });

      if (!cart) {
        throw new NotFoundException(`Cart with ID ${cartId} not found.`);
      }

      const updatedCart = await client.cart.update({
        where: { id: cartId },
        data: {
          items: {
            update: {
              where: { id: cart.items[0]?.id }, // Assumes single-item cart for simplicity
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
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while updating the cart.',
      );
    }
  }

  async getAllCarts(storeDbUrl: string, userId: number) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const carts = await client.cart.findMany({
        where: { userId },
        include: { items: true },
      });

      return {
        success: true,
        message: 'Carts retrieved successfully',
        data: carts,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while retrieving carts.',
      );
    }
  }

  async getCart(storeDbUrl: string, cartId: number) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const cart = await client.cart.findUnique({
        where: { id: cartId },
        include: { items: true },
      });

      if (!cart) {
        throw new NotFoundException(`Cart with ID ${cartId} not found.`);
      }

      return {
        success: true,
        message: 'Cart retrieved successfully',
        data: cart,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while retrieving the cart.',
      );
    }
  }

  async deleteCart(storeDbUrl: string, cartId: number) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const cart = await client.cart.findUnique({
        where: { id: cartId },
      });

      if (!cart) {
        throw new NotFoundException(`Cart with ID ${cartId} not found.`);
      }

      await client.cart.delete({
        where: { id: cartId },
      });

      return {
        success: true,
        message: 'Cart deleted successfully',
        data: null,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while deleting the cart.',
      );
    }
  }
}
