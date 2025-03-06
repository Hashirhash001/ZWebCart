import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateSectionDto } from './dtos/create-section.dto';
import { UpdateSectionDto } from './dtos/update-section.dto';
import { PrismaDynamicService } from '../../../prisma/prisma.service';

@Injectable()
export class SectionsService {
  constructor(private readonly prismaDynamicService: PrismaDynamicService) {}

  async create(storeDbUrl: string, storeId: number, data: CreateSectionDto) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
    console.log('Store ID:', storeId);

    const storeSettings = await storePrisma.storeSettings.findFirst({
      where: { storeId: String(storeId) },
    });

    if (!storeSettings) {
      throw new HttpException(
        {
          success: false,
          message: 'StoreSettings not found',
          data: null,
        },
        HttpStatus.NOT_FOUND
      );
    }

    // Check if themeId exists
    if (data.themeId) {
      const themeExists = await storePrisma.theme.findUnique({
        where: { id: data.themeId },
      });

      if (!themeExists) {
        throw new HttpException(
          {
            success: false,
            message: `Theme with ID ${data.themeId} does not exist`,
            data: null,
          },
          HttpStatus.BAD_REQUEST
        );
      }
    }

    try {
      const section = await storePrisma.section.create({ data });

      return {
        success: true,
        message: 'Section created successfully',
        data: section,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to create section: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(storeDbUrl: string) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const sections = await storePrisma.section.findMany();
      return {
        success: true,
        message: 'Sections retrieved successfully',
        data: sections,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve sections: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByTheme(storeDbUrl: string, themeId: number) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const sections = await storePrisma.section.findMany({ where: { themeId } });

      return {
        success: true,
        message: 'Sections retrieved successfully',
        data: sections,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve sections: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByPage(storeDbUrl: string, pageId: number) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const sections = await storePrisma.section.findMany({ where: { pageId } });

      return {
        success: true,
        message: 'Sections retrieved successfully',
        data: sections,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve sections: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(storeDbUrl: string, id: number, data: UpdateSectionDto) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);

    // Check if request body is empty
    if (Object.keys(data).length === 0) {
        throw new HttpException(
            {
                success: false,
                message: 'Update failed: Request body is empty',
                data: null,
            },
            HttpStatus.BAD_REQUEST
        );
    }

    try {
        // Check if section exists before updating
        const existingSection = await storePrisma.section.findUnique({ where: { id } });
        if (!existingSection) {
            throw new HttpException(
                {
                    success: false,
                    message: `Section with ID ${id} not found`,
                    data: null,
                },
                HttpStatus.NOT_FOUND
            );
        }

        const updatedSection = await storePrisma.section.update({
            where: { id },
            data,
        });

        return {
            success: true,
            message: 'Section updated successfully',
            data: updatedSection,
        };
    } catch (error) {
        throw new HttpException(
            {
                success: false,
                message: `Failed to update section: ${error.message}`,
                data: null,
            },
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }


  async delete(storeDbUrl: string, id: number) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const section = await storePrisma.section.delete({ where: { id } });

      return {
        success: true,
        message: 'Section deleted successfully',
        data: section,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to delete section: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
