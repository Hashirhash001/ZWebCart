import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaDynamicService } from '../../../prisma/prisma.service';
import { CreateThemeDto } from './dtos/create-theme.dto';
import { UpdateThemeDto } from './dtos/update-theme.dto';

@Injectable()
export class ThemesService {
  constructor(private readonly prismaDynamicService: PrismaDynamicService) {}

  /**
   * Creates a new theme.
   * @param storeDbUrl - The store's database URL.
   * @param data - Theme details from CreateThemeDto.
   * @returns A success response with created theme data or an error message.
   */
  async createTheme(storeDbUrl: string, storeId: string, data: CreateThemeDto) {
    try {
      const prisma = this.prismaDynamicService.getClient(storeDbUrl);
      console.log('Store ID:', storeId);
  
      const storeSettings = await prisma.storeSettings.findFirst({
        where: { storeId: storeId },
      });
  
      if (!storeSettings) throw new Error("StoreSettings not found");
  
      // Deactivate any existing active theme safely
      await prisma.theme.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
      
      const theme = await prisma.theme.create({
        data: {
          name: data.name || 'Default Theme',
          currentVersion: 1,
          templateUrl: data.templateUrl || '/themes/default',
          isActive: true,
          ThemeVersion: {
            create: {
              version: 1,
              config: {},
              isDefault: true,
            },
          },
        },
      });
  
      return { success: true, message: 'Theme created successfully', data: theme };
    } catch (error) {
      console.error('Error creating theme:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to create theme',
      });
    }
  }

  /**
   * Fetches all themes from the store.
   * @param storeDbUrl - The store's database URL.
   * @returns A success response with the list of themes or an error message.
   */
  async getThemes(storeDbUrl: string) {
    try {
      const prisma = this.prismaDynamicService.getClient(storeDbUrl);
      const themes = await prisma.theme.findMany();

      return { success: true, message: 'Themes retrieved successfully', data: themes };
    } catch (error) {
      console.error('Error retrieving themes:', error);
      throw new InternalServerErrorException({ success: false, message: 'Failed to retrieve themes' });
    }
  }

  /**
   * Fetches a single theme by ID.
   * @param storeDbUrl - The store's database URL.
   * @param id - Theme ID.
   * @returns A success response with theme data or an error message.
   */
  async getTheme(storeDbUrl: string, id: string) {
    try {
      const themeId = Number(id);
      if (isNaN(themeId)) throw new BadRequestException({ success: false, message: 'Invalid theme ID' });

      const prisma = this.prismaDynamicService.getClient(storeDbUrl);
      const theme = await prisma.theme.findUnique({ where: { id: themeId } });

      if (!theme) throw new NotFoundException({ success: false, message: 'Theme not found' });

      return { success: true, message: 'Theme retrieved successfully', data: theme };
    } catch (error) {
      console.error('Error retrieving theme:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException({ success: false, message: 'Failed to retrieve theme' });
    }
  }

  /**
   * Updates a theme by ID.
   * @param storeDbUrl - The store's database URL.
   * @param id - Theme ID.
   * @param data - Theme update details from UpdateThemeDto.
   * @returns A success response with updated theme data or an error message.
   */
  async updateTheme(storeDbUrl: string, id: string, data: UpdateThemeDto) {
    try {
      const themeId = Number(id);
      if (isNaN(themeId)) throw new BadRequestException({ success: false, message: 'Invalid theme ID' });

      const prisma = this.prismaDynamicService.getClient(storeDbUrl);
      const updatedTheme = await prisma.theme.update({
        where: { id: themeId },
        data,
      });

      return { success: true, message: 'Theme updated successfully', data: updatedTheme };
    } catch (error) {
      console.error('Error updating theme:', error);
      if (error.code === 'P2025') throw new NotFoundException({ success: false, message: 'Theme not found' });
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException({ success: false, message: 'Failed to update theme' });
    }
  }

  /**
   * Deletes a theme by ID.
   * @param storeDbUrl - The store's database URL.
   * @param id - Theme ID.
   * @returns A success response or an error message.
   */
  async deleteTheme(storeDbUrl: string, id: string) {
    try {
      const themeId = Number(id);
      if (isNaN(themeId)) throw new BadRequestException({ success: false, message: 'Invalid theme ID' });

      const prisma = this.prismaDynamicService.getClient(storeDbUrl);
      await prisma.theme.delete({ where: { id: themeId } });

      return { success: true, message: 'Theme deleted successfully' };
    } catch (error) {
      console.error('Error deleting theme:', error);
      if (error.code === 'P2025') throw new NotFoundException({ success: false, message: 'Theme not found' });
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException({ success: false, message: 'Failed to delete theme' });
    }
  }
}
