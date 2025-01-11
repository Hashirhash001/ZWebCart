import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import * as fs from 'fs';
import * as path from 'path';
import { File } from 'multer';
import * as multer from 'multer';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaCentralService,
    private prismaStore: PrismaDynamicService,
  ) {}

  // Create Product with Attributes and Images
  async createProduct(
    storeDbUrl: string,
    createProductDto: CreateProductDto,
    files: File[],
  ) {
    const client = this.prismaStore.getClient(storeDbUrl);
    try {
      // Parse and validate `price` and `stock`
      const parsedPrice = parseFloat(
        createProductDto.price as unknown as string,
      ); // Ensures it's a float
      const parsedStock = parseInt(createProductDto.stock.toString(), 10);

      if (isNaN(parsedPrice) || isNaN(parsedStock)) {
        throw new BadRequestException('Invalid price or stock values');
      }

      // Ensure categoryId is an integer before passing to Prisma
      const parsedCategoryId = parseInt(
        createProductDto.categoryId.toString(),
        10,
      );
      if (isNaN(parsedCategoryId)) {
        throw new BadRequestException('Invalid category ID');
      }

      // Validate Category
      const category = await client.category.findUnique({
        where: { id: parsedCategoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Create Product
      const product = await client.product.create({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: parsedPrice, // Use parsed price
          categoryId: parsedCategoryId,
          stock: parsedStock, // Use parsed stock
        },
      });

      // Handle Attributes
      let attributes = [];
      if (
        createProductDto.attributes &&
        createProductDto.attributes.length > 0
      ) {
        attributes = await Promise.all(
          createProductDto.attributes.map((attribute) =>
            client.productAttribute.create({
              data: {
                productId: product.id,
                key: attribute.key,
                value: attribute.value,
              },
            }),
          ),
        );
      }

      // Handle Images
      let images = [];
      if (files && files.length > 0) {
        images = await Promise.all(
          files.map((file, index) => {
            const imageUrl = this.saveImageToLocal(file, product.id);
            return client.productImage.create({
              data: {
                productId: product.id,
                url: imageUrl,
                isPrimary: index === 0,
              },
            });
          }),
        );
      }

      // Fetch product with related attributes and images for the response
      const productWithRelations = await client.product.findUnique({
        where: { id: product.id },
        include: {
          attributes: true, // Includes product attributes
          images: true, // Includes product images
        },
      });

      return {
        success: true,
        message: 'Product created successfully',
        data: productWithRelations,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      // Preserve original exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
    }
  }

  // Update Product with Attributes and Images
  async updateProduct(
    storeDbUrl: string,
    productId: number,
    updateProductDto: UpdateProductDto,
    files: File[],
  ) {
    const client = this.prismaStore.getClient(storeDbUrl);

    try {
      // Fetch the existing product
      const existingProduct = await client.product.findUnique({
        where: { id: productId },
      });

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      // Validate the new category (if provided)
      if (updateProductDto.categoryId !== undefined) {
        const category = await client.category.findUnique({
          where: { id: updateProductDto.categoryId },
        });
        if (!category) {
          throw new NotFoundException('Category not found');
        }
      }

      // Update product details
      const updatedProduct = await client.product.update({
        where: { id: productId },
        data: {
          name: updateProductDto.name ?? existingProduct.name,
          description:
            updateProductDto.description ?? existingProduct.description,
          price: updateProductDto.price ?? existingProduct.price,
          stock: updateProductDto.stock ?? existingProduct.stock,
          categoryId: updateProductDto.categoryId ?? existingProduct.categoryId,
        },
      });

      // Update or add attributes
      if (updateProductDto.attributes) {
        // Delete existing attributes
        await client.productAttribute.deleteMany({
          where: { productId },
        });

        // Add updated attributes
        await Promise.all(
          updateProductDto.attributes.map((attribute) =>
            client.productAttribute.create({
              data: {
                productId,
                key: attribute.key,
                value: attribute.value,
              },
            }),
          ),
        );
      }

      // Handle uploaded files
      if (files && files.length > 0) {
        // Delete existing images
        await client.productImage.deleteMany({
          where: { productId },
        });

        // Save new images
        await Promise.all(
          files.map((file, index) => {
            const imageUrl = this.saveImageToLocal(file, productId);
            return client.productImage.create({
              data: {
                productId,
                url: imageUrl,
                isPrimary: index === 0,
              },
            });
          }),
        );
      }

      // Fetch the updated product with related attributes and images
      const productWithRelations = await client.product.findUnique({
        where: { id: productId },
        include: {
          attributes: true, // Includes updated product attributes
          images: true, // Includes updated product images
        },
      });

      return {
        success: true,
        message: 'Product updated successfully',
        data: productWithRelations,
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new InternalServerErrorException(
        error.message || 'Error updating product',
      );
    }
  }

  // Save image to local storage
  saveImageToLocal(file: File, productId: number): string {
    const uploadDir = './uploads';

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
    }

    const filePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);

    try {
      // Move file to the uploads directory
      fs.renameSync(file.path, filePath);

      // Return the saved file path (you may want to store a relative path)
      return filePath.replace(/\\/g, '/'); // Normalize the path for cross-platform compatibility
    } catch (error) {
      console.error('Error saving image to local storage:', error);
      throw new BadRequestException('Error saving the image locally');
    }
  }

  // Get All Products
  async getProducts(storeDbUrl: string) {
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
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new InternalServerErrorException(
        error.message || 'Error fetching products',
      );
    }
  }

  // Get a Single Product with Attributes and Images
  async getProduct(storeDbUrl: string, id: string) {
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
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new InternalServerErrorException(
        error.message || 'Error fetching product',
      );
    }
  }

  // Delete Product
  async deleteProduct(storeDbUrl: string, id: string) {
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

      // Delete related records first (cascade delete manually)
      await client.productAttribute.deleteMany({
        where: { productId: parsedId },
      });

      await client.productImage.deleteMany({
        where: { productId: parsedId },
      });

      // Now delete the product
      await client.product.delete({
        where: { id: parsedId },
      });

      return {
        success: true,
        message: 'Product deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new InternalServerErrorException(
        error.message || 'Error deleting product',
      );
    }
  }

  async filterProductsByCategory(storeDbUrl: string, categoryId: string) {
    const client = this.prismaStore.getClient(storeDbUrl);

    try {
      const parsedCategoryId = parseInt(categoryId, 10);
      if (isNaN(parsedCategoryId)) {
        throw new BadRequestException('Invalid category ID');
      }

      // Validate the category exists
      const category = await client.category.findUnique({
        where: { id: parsedCategoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Get all descendant categories including the given category
      const descendantCategories = await client.categoryHierarchy.findMany({
        where: { ancestorId: parsedCategoryId },
        select: { descendantId: true },
      });

      const categoryIds = [
        parsedCategoryId, // Include the root category
        ...descendantCategories.map((item) => item.descendantId),
      ];

      // Filter products by these category IDs
      const products = await client.product.findMany({
        where: {
          categoryId: { in: categoryIds },
        },
        include: {
          attributes: true, // Include product attributes
          images: true, // Include product images
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
    } catch (error) {
      console.error('Error filtering products by category:', error);
      throw new InternalServerErrorException(
        error.message || 'Error filtering products',
      );
    }
  }

  // Filter Products by Price and Attributes
  async filterProductsByPriceAndAttributes(
    storeDbUrl: string,
    minPrice: number | null,
    maxPrice: number | null,
    attributes: Record<string, string> = {},
  ) {
    const client = this.prismaStore.getClient(storeDbUrl);

    try {
      // Ensure attributes is an object
      if (typeof attributes !== 'object' || attributes === null) {
        attributes = {}; // Default to an empty object
      }

      // Build the Prisma query `where` object
      const where: any = {};

      // Add price filters if minPrice or maxPrice are provided
      if (minPrice !== null) {
        where.price = { gte: minPrice };
      }
      if (maxPrice !== null) {
        where.price = { ...where.price, lte: maxPrice };
      }

      // Add attribute filters only if attributes is not empty
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

      // Fetch products with the conditions
      const products = await client.product.findMany({
        where,
        include: {
          attributes: true, // Include attributes
          images: true, // Include images
        },
      });

      // Return response if no products are found
      if (products.length === 0) {
        return {
          success: false,
          message: 'No products found with the given filters',
          data: null,
        };
      }

      // Return the filtered products
      return {
        success: true,
        message: 'Products fetched successfully',
        data: products,
      };
    } catch (error) {
      console.error('Error filtering products by price and attributes:', error);
      throw new InternalServerErrorException(
        error.message || 'Error filtering products',
      );
    }
  }
}
