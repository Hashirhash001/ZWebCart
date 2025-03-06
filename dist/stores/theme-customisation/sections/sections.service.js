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
exports.SectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let SectionsService = class SectionsService {
    constructor(prismaDynamicService) {
        this.prismaDynamicService = prismaDynamicService;
    }
    async create(storeDbUrl, storeId, data) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        console.log('Store ID:', storeId);
        const storeSettings = await storePrisma.storeSettings.findFirst({
            where: { storeId: String(storeId) },
        });
        if (!storeSettings) {
            throw new common_1.HttpException({
                success: false,
                message: 'StoreSettings not found',
                data: null,
            }, common_1.HttpStatus.NOT_FOUND);
        }
        if (data.themeId) {
            const themeExists = await storePrisma.theme.findUnique({
                where: { id: data.themeId },
            });
            if (!themeExists) {
                throw new common_1.HttpException({
                    success: false,
                    message: `Theme with ID ${data.themeId} does not exist`,
                    data: null,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
        }
        try {
            const section = await storePrisma.section.create({ data });
            return {
                success: true,
                message: 'Section created successfully',
                data: section,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to create section: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(storeDbUrl) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const sections = await storePrisma.section.findMany();
            return {
                success: true,
                message: 'Sections retrieved successfully',
                data: sections,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to retrieve sections: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findByTheme(storeDbUrl, themeId) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const sections = await storePrisma.section.findMany({ where: { themeId } });
            return {
                success: true,
                message: 'Sections retrieved successfully',
                data: sections,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to retrieve sections: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findByPage(storeDbUrl, pageId) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const sections = await storePrisma.section.findMany({ where: { pageId } });
            return {
                success: true,
                message: 'Sections retrieved successfully',
                data: sections,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to retrieve sections: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(storeDbUrl, id, data) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        if (Object.keys(data).length === 0) {
            throw new common_1.HttpException({
                success: false,
                message: 'Update failed: Request body is empty',
                data: null,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const existingSection = await storePrisma.section.findUnique({ where: { id } });
            if (!existingSection) {
                throw new common_1.HttpException({
                    success: false,
                    message: `Section with ID ${id} not found`,
                    data: null,
                }, common_1.HttpStatus.NOT_FOUND);
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
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to update section: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async delete(storeDbUrl, id) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const section = await storePrisma.section.delete({ where: { id } });
            return {
                success: true,
                message: 'Section deleted successfully',
                data: section,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to delete section: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SectionsService = SectionsService;
exports.SectionsService = SectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaDynamicService])
], SectionsService);
//# sourceMappingURL=sections.service.js.map