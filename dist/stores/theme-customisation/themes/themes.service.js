"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ThemesService = class ThemesService {
    constructor(prismaDynamicService) {
        this.prismaDynamicService = prismaDynamicService;
    }
    async createTheme(storeDbUrl, storeId, data) {
        try {
            const prisma = this.prismaDynamicService.getClient(storeDbUrl);
            console.log('Store ID:', storeId);
            const storeSettings = await prisma.storeSettings.findFirst({
                where: { storeId: storeId },
            });
            if (!storeSettings)
                throw new Error("StoreSettings not found");
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
        }
        catch (error) {
            console.error('Error creating theme:', error);
            throw new common_1.InternalServerErrorException({
                success: false,
                message: 'Failed to create theme',
            });
        }
    }
    async getThemes(storeDbUrl) {
        try {
            const prisma = this.prismaDynamicService.getClient(storeDbUrl);
            const themes = await prisma.theme.findMany();
            return { success: true, message: 'Themes retrieved successfully', data: themes };
        }
        catch (error) {
            console.error('Error retrieving themes:', error);
            throw new common_1.InternalServerErrorException({ success: false, message: 'Failed to retrieve themes' });
        }
    }
    async getTheme(storeDbUrl, id) {
        try {
            const themeId = Number(id);
            if (isNaN(themeId))
                throw new common_1.BadRequestException({ success: false, message: 'Invalid theme ID' });
            const prisma = this.prismaDynamicService.getClient(storeDbUrl);
            const theme = await prisma.theme.findUnique({ where: { id: themeId } });
            if (!theme)
                throw new common_1.NotFoundException({ success: false, message: 'Theme not found' });
            return { success: true, message: 'Theme retrieved successfully', data: theme };
        }
        catch (error) {
            console.error('Error retrieving theme:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException({ success: false, message: 'Failed to retrieve theme' });
        }
    }
    async updateTheme(storeDbUrl, id, data) {
        try {
            const themeId = Number(id);
            if (isNaN(themeId))
                throw new common_1.BadRequestException({ success: false, message: 'Invalid theme ID' });
            const prisma = this.prismaDynamicService.getClient(storeDbUrl);
            const updatedTheme = await prisma.theme.update({
                where: { id: themeId },
                data,
            });
            return { success: true, message: 'Theme updated successfully', data: updatedTheme };
        }
        catch (error) {
            console.error('Error updating theme:', error);
            if (error.code === 'P2025')
                throw new common_1.NotFoundException({ success: false, message: 'Theme not found' });
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException({ success: false, message: 'Failed to update theme' });
        }
    }
    async deleteTheme(storeDbUrl, id) {
        try {
            const themeId = Number(id);
            if (isNaN(themeId))
                throw new common_1.BadRequestException({ success: false, message: 'Invalid theme ID' });
            const prisma = this.prismaDynamicService.getClient(storeDbUrl);
            await prisma.theme.delete({ where: { id: themeId } });
            return { success: true, message: 'Theme deleted successfully' };
        }
        catch (error) {
            console.error('Error deleting theme:', error);
            if (error.code === 'P2025')
                throw new common_1.NotFoundException({ success: false, message: 'Theme not found' });
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException({ success: false, message: 'Failed to delete theme' });
        }
    }
};
exports.ThemesService = ThemesService;
exports.ThemesService = ThemesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaDynamicService])
], ThemesService);
//# sourceMappingURL=themes.service.js.map