import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { AddToWishlistDto } from './dtos/add-to-wishlist.dto';
import { UpdateWishlistItemDto } from './dtos/update-wishlist-item.dto';

@Injectable()
export class WishlistService {
  constructor(private readonly prismaDynamicService: PrismaDynamicService) {}

  async createWishlist(
    storeDbUrl: string,
    userId: number,
    createWishlistDto: AddToWishlistDto,
  ) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);
    const { productId } = createWishlistDto;
  
    // Verify that the product exists
    const product = await client.product.findUnique({
      where: { id: productId },
    });
  
    if (!product) {
      throw new BadRequestException('Product does not exist.');
    }
  
    const wishlist = await client.wishlist.findUnique({ where: { userId } });
  
    if (!wishlist) {
      return client.wishlist.create({
        data: {
          userId,
          items: { create: { productId } },
        },
        include: { items: true },
      });
    }
  
    const existingItem = await client.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });
  
    if (existingItem) {
      throw new BadRequestException('Product is already in the wishlist.');
    }
  
    return client.wishlist.update({
      where: { id: wishlist.id },
      data: {
        items: { create: { productId } },
      },
      include: { items: true },
    });
  }
  

  async updateWishlist(
    storeDbUrl: string,
    wishlistId: number,
    userId: number,
    updateWishlistDto: UpdateWishlistItemDto,
  ) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);
    const { productId } = updateWishlistDto;

    const wishlist = await client.wishlist.findUnique({
      where: { id: wishlistId },
    });

    if (!wishlist || wishlist.userId !== userId) {
      throw new NotFoundException('Wishlist not found or unauthorized.');
    }

    const existingItem = await client.wishlistItem.findFirst({
      where: { wishlistId, productId },
    });

    if (!existingItem) {
      throw new BadRequestException('Product not found in the wishlist.');
    }

    return client.wishlistItem.update({
      where: { id: existingItem.id },
      data: { productId },
    });
  }

  async getWishlist(storeDbUrl: string, userId: number) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);

    const wishlist = await client.wishlist.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                stock: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found.');
    }

    const itemsWithStockFlags = wishlist.items.map((item) => ({
      ...item,
      outOfStock: item.product.stock <= 0,
    }));

    return {
      success: true,
      message: 'Wishlist retrieved successfully',
      data: { ...wishlist, items: itemsWithStockFlags },
    };
  }

  async deleteWishlist(storeDbUrl: string, userId: number, wishlistId: number) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);
  
    const wishlist = await client.wishlist.findFirst({
      where: { id: wishlistId, userId }, // Match userId with wishlistId
    });
  
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found or unauthorized.');
    }
  
    await client.wishlistItem.deleteMany({ where: { wishlistId } });
    const result = await client.wishlist.delete({ where: { id: wishlistId } });
  
    return {
      success: true,
      message: 'Wishlist deleted successfully.',
      data: result,
    };
  }
      

  async moveToCartFromWishlist(
    storeDbUrl: string,
    userId: number,
    productId: number,
    quantity: number = 1,
  ) {
    const client = this.prismaDynamicService.getClient(storeDbUrl);
  
    // Ensure the quantity is valid
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero.');
    }
  
    // Fetch the wishlist for the user
    const wishlist = await client.wishlist.findFirst({
      where: { userId },
      include: { items: true },
    });
  
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found.');
    }
  
    // Fetch the wishlist item for the given product
    const wishlistItem = await client.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
      include: {
        product: true, // Include product details to check stock
      },
    });
  
    if (!wishlistItem) {
      throw new NotFoundException('Product not found in the wishlist.');
    }
  
    // Ensure the product has sufficient stock
    if (wishlistItem.product.stock <= 0) {
      throw new BadRequestException('Product is out of stock.');
    }
  
    // Fetch or create the cart for the user
    const cart = await client.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { items: true },
    });
  
    // Check if the product already exists in the cart
    const existingCartItem = cart.items.find(
      (item) => item.productId === wishlistItem.productId,
    );
  
    if (existingCartItem) {
      // Update the quantity of the existing product in the cart
      await client.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      // Add the product to the cart as a new item
      await client.cartItem.create({
        data: {
          cartId: cart.id,
          productId: wishlistItem.productId,
          quantity,
        },
      });
    }
  
    // Remove the product from the wishlist
    await client.wishlistItem.delete({ where: { id: wishlistItem.id } });
  
    return {
      success: true,
      message: 'Product moved from wishlist to cart.',
    };
  }
  
}
