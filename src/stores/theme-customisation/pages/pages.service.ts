import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePageDto } from './dtos/create-page.dto';
import { UpdatePageDto } from './dtos/update-page.dto';
import { PrismaDynamicService } from '../../../prisma/prisma.service';
import { AddSectionsToPageDto } from './dtos/add-sections-to-page.dto';

@Injectable()
export class PagesService {
  constructor(private readonly prismaDynamicService: PrismaDynamicService) {}

  async create(storeDbUrl: string, data: CreatePageDto) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const createData: any = {
        title: data.title,
        slug: data.slug,
        config: data.config || undefined, // Optional JSON field
      };

      // Handle theme relation
      if (data.themeId) {
        createData.theme = { connect: { id: data.themeId } };
      }

      // Check if a page with the same slug exists
      const existingPage = await storePrisma.page.findUnique({
        where: { slug: data.slug },
      });

      if (existingPage) {
        throw new HttpException(
          {
            success: false,
            message: `A page with the slug '${data.slug}' already exists.`,
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const page = await storePrisma.page.create({ data: createData });

      return {
        success: true,
        message: 'Page created successfully',
        data: page,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to create page: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addSectionsToPage(
    storeDbUrl: string,
    pageId: number,
    data: AddSectionsToPageDto,
  ) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      // Validate if the page exists
      const page = await storePrisma.page.findUnique({ where: { id: pageId } });
      if (!page) {
        throw new HttpException(
          { success: false, message: 'Page not found', data: null },
          HttpStatus.NOT_FOUND,
        );
      }

      // Validate if all sections exist
      const sectionIds = data.sections.map((s) => s.sectionId);
      const existingSections = await storePrisma.section.findMany({
        where: { id: { in: sectionIds } },
      });

      if (existingSections.length !== sectionIds.length) {
        throw new HttpException(
          { success: false, message: 'Some sections do not exist', data: null },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Fetch existing page-section mappings to avoid duplicates
      const existingPageSections = await storePrisma.pageSection.findMany({
        where: {
          pageId,
          sectionId: { in: sectionIds },
        },
        select: { sectionId: true },
      });

      const existingSectionIds = new Set(
        existingPageSections.map((ps) => ps.sectionId),
      );

      // Filter out sections that are already linked to the page
      const newPageSections = data.sections
        .filter((s) => !existingSectionIds.has(s.sectionId))
        .map((s) => ({
          pageId,
          sectionId: s.sectionId,
          order: s.order,
        }));

      if (newPageSections.length === 0) {
        return {
          success: false,
          message: 'All sections are already added to the page',
          data: null,
        };
      }

      // Add new sections to the page
      await storePrisma.pageSection.createMany({ data: newPageSections });

      return {
        success: true,
        message: 'Sections added to the page successfully',
        data: newPageSections,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to add sections: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(storeDbUrl: string) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
    try {
      const pages = await storePrisma.page.findMany({ orderBy: { id: 'asc' } });
      return {
        success: true,
        message: 'Pages retrieved successfully',        
        data: pages,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve pages: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(storeDbUrl: string, id: number) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
    try {
      const page = await storePrisma.page.findUnique({ where: { id }});
    }
    catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve page: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(storeDbUrl: string, id: number, data: UpdatePageDto) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);

    try {
      const updateData: any = {
        title: data.title,
        slug: data.slug,
        config: data.config || undefined, // Optional JSON field
      };

      // Handle theme relation
      if (data.themeId) {
        updateData.theme = { connect: { id: data.themeId } };
      }

      const page = await storePrisma.page.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'Page updated successfully',
        data: page,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to update page: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(storeDbUrl: string, id: number) {
    const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
    try {
      await storePrisma.page.delete({ where: { id } });
      return {
        success: true,
        message: 'Page deleted successfully',
        data: null,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to delete page: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
