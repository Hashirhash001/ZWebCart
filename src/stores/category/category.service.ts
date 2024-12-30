import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { buildHierarchy } from './utils/category.utils';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaDynamicService,
    private readonly prismaCentral: PrismaCentralService,
  ) {}

  // Create Category
  async createCategory(storeDbUrl: string, data: CreateCategoryDto) {
    const { name, description, parentId } = data;

    // Get the dynamic Prisma client
    const client = this.prisma.getClient(storeDbUrl);

    try {
      // Validate name uniqueness
      const existingCategory = await client.category.findUnique({
        where: { name },
      });
      if (existingCategory) {
        return {
          success: false,
          message: 'Category name must be unique',
          data: null,
        };
      }

      // If parentId is provided, validate that the parent category exists
      if (parentId) {
        const parentCategory = await client.category.findUnique({
          where: { id: parentId },
        });

        if (!parentCategory) {
          return {
            success: false,
            message: 'Parent category not found',
            data: null,
          };
        }
      }

      // Create the new category
      const newCategory = await client.category.create({
        data: {
          name,
          description,
        },
      });

      // If parentId is provided, create the hierarchy
      if (parentId) {
        await client.categoryHierarchy.create({
          data: {
            ancestorId: parentId,
            descendantId: newCategory.id,
            depth: 1,
          },
        });

        // Update all ancestor relationships
        const ancestors = await client.categoryHierarchy.findMany({
          where: { descendantId: parentId },
        });

        for (const ancestor of ancestors) {
          await client.categoryHierarchy.create({
            data: {
              ancestorId: ancestor.ancestorId,
              descendantId: newCategory.id,
              depth: ancestor.depth + 1,
            },
          });
        }
      }

      return {
        success: true,
        message: 'Category created successfully',
        data: newCategory,
      };
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        success: false,
        message: error.message || 'Error creating category',
        data: null,
      };
    }
  }

  // Get Category Hierarchy
  async getCategoryHierarchy(storeDbUrl: string) {
    // Get the dynamic Prisma client
    const client = this.prisma.getClient(storeDbUrl);

    try {
      const categories = await client.category.findMany({
        include: {
          descendants: true, // Include descendants based on CategoryHierarchy
        },
      });

      const hierarchy = buildHierarchy(categories); // Use the utility function

      return {
        success: true,
        message: 'Category hierarchy fetched successfully',
        data: hierarchy,
      };
    } catch (error) {
      console.error('Error fetching category hierarchy:', error);
      return {
        success: false,
        message: error.message || 'Error fetching category hierarchy',
        data: null,
      };
    }
  }

  // Delete Category
  async deleteCategory(storeDbUrl: string, id: number) {
    // Get the dynamic Prisma client
    const client = this.prisma.getClient(storeDbUrl);

    try {
      // Validate category existence
      const category = await client.category.findUnique({ where: { id } });
      if (!category) {
        return {
          success: false,
          message: 'Category not found',
          data: null,
        };
      }

      // Delete hierarchy entries
      await client.categoryHierarchy.deleteMany({
        where: { OR: [{ ancestorId: id }, { descendantId: id }] },
      });

      // Delete the category
      await client.category.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Category deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        message: error.message || 'Error deleting category',
        data: null,
      };
    }
  }
}
