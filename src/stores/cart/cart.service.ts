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

      // Validate that the product exists
      const product = await client.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new BadRequestException(`Product with ID ${productId} does not exist.`);
      }
  
      // Check if a cart already exists for the user
      const existingCart = await client.cart.findUnique({
        where: { userId },
        include: { items: true },
      });
  
      if (existingCart) {
        // Check if the product is already in the cart
        const existingItem = existingCart.items.find(
          (item) => item.productId === productId,
        );
  
        if (existingItem) {
          // Update the quantity of the existing product
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
        } else {
          // Add the new product to the existing cart
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
  
      // Create a new cart if one does not exist
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
    userId: number,
    updateCartDto: UpdateCartItemDto,
  ) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);
  
    try {
      const { productId, quantity } = updateCartDto;
  
      if (!productId || quantity === undefined) {
        throw new BadRequestException('Product ID and quantity are required.');
      }
  
      if (quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than zero.');
      }

      // Validate that the product exists
      const product = await client.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new BadRequestException(`Product with ID ${productId} does not exist.`);
      }
  
      // Fetch cart and verify ownership
      const cart = await client.cart.findUnique({
        where: { id: cartId },
        include: { items: true },
      });
  
      if (!cart) {
        throw new NotFoundException(`Cart with ID ${cartId} not found.`);
      }
  
      if (cart.userId !== userId) {
        throw new BadRequestException('You are not authorized to update this cart.');
      }
  
      // Check if the product exists in the cart
      const cartItem = cart.items.find((item) => item.productId === productId);
      if (!cartItem) {
        throw new BadRequestException(
          `Product with ID ${productId} not found in the cart.`,
        );
      }
  
      // Update the quantity of the product in the cart
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
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while updating the cart.',
      );
    }
  }  

  async getCart(storeDbUrl: string, userId: number) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);
  
    try {
      const cart = await client.cart.findFirst({
        where: { userId },
        include: { items: true },
      });
  
      if (!cart) {
        throw new NotFoundException(`Cart for user ID ${userId} not found.`);
      }

      if (cart.userId !== userId) {
        throw new BadRequestException('You are not authorized to update this cart.');
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
  
  async deleteCart(storeDbUrl: string, cartId: number, userId: number) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);
  
    try {
      const cart = await client.cart.findUnique({
        where: { id: cartId },
        include: { items: true }, // Include items to handle them before deleting
      });
  
      if (!cart) {
        throw new NotFoundException(`Cart with ID ${cartId} not found.`);
      }
  
      if (cart.userId !== userId) {
        throw new BadRequestException('You are not authorized to delete this cart.');
      }
  
      // Delete related CartItem entries
      await client.cartItem.deleteMany({
        where: { cartId },
      });
  
      // Delete the cart
      await client.cart.delete({
        where: { id: cartId },
      });
  
      return {
        success: true,
        message: 'Cart and associated items deleted successfully',
        data: null,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while deleting the cart.',
      );
    }
  }
  
}
