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
exports.PagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PagesService = class PagesService {
    constructor(prismaDynamicService) {
        this.prismaDynamicService = prismaDynamicService;
    }
    async create(storeDbUrl, data) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const createData = {
                title: data.title,
                slug: data.slug,
                config: data.config || undefined,
            };
            if (data.themeId) {
                createData.theme = { connect: { id: data.themeId } };
            }
            const existingPage = await storePrisma.page.findUnique({
                where: { slug: data.slug },
            });
            if (existingPage) {
                throw new common_1.HttpException({
                    success: false,
                    message: `A page with the slug '${data.slug}' already exists.`,
                    data: null,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const page = await storePrisma.page.create({ data: createData });
            return {
                success: true,
                message: 'Page created successfully',
                data: page,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to create page: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async addSectionsToPage(storeDbUrl, pageId, data) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const page = await storePrisma.page.findUnique({ where: { id: pageId } });
            if (!page) {
                throw new common_1.HttpException({ success: false, message: 'Page not found', data: null }, common_1.HttpStatus.NOT_FOUND);
            }
            const sectionIds = data.sections.map((s) => s.sectionId);
            const existingSections = await storePrisma.section.findMany({
                where: { id: { in: sectionIds } },
            });
            if (existingSections.length !== sectionIds.length) {
                throw new common_1.HttpException({ success: false, message: 'Some sections do not exist', data: null }, common_1.HttpStatus.BAD_REQUEST);
            }
            const existingPageSections = await storePrisma.pageSection.findMany({
                where: {
                    pageId,
                    sectionId: { in: sectionIds },
                },
                select: { sectionId: true },
            });
            const existingSectionIds = new Set(existingPageSections.map((ps) => ps.sectionId));
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
            await storePrisma.pageSection.createMany({ data: newPageSections });
            return {
                success: true,
                message: 'Sections added to the page successfully',
                data: newPageSections,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to add sections: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(storeDbUrl) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const pages = await storePrisma.page.findMany({ orderBy: { id: 'asc' } });
            return {
                success: true,
                message: 'Pages retrieved successfully',
                data: pages,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to retrieve pages: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(storeDbUrl, id) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const page = await storePrisma.page.findUnique({ where: { id } });
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to retrieve page: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(storeDbUrl, id, data) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            const updateData = {
                title: data.title,
                slug: data.slug,
                config: data.config || undefined,
            };
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
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to update page: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async delete(storeDbUrl, id) {
        const storePrisma = this.prismaDynamicService.getClient(storeDbUrl);
        try {
            await storePrisma.page.delete({ where: { id } });
            return {
                success: true,
                message: 'Page deleted successfully',
                data: null,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to delete page: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.PagesService = PagesService;
exports.PagesService = PagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaDynamicService])
], PagesService);
//# sourceMappingURL=pages.service.js.map