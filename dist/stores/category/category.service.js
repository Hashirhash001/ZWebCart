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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const category_utils_1 = require("./utils/category.utils");
let CategoryService = class CategoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCategory(storeDbUrl, data) {
        const { name, description, parentId } = data;
        const client = this.prisma.getClient(storeDbUrl);
        try {
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
            const newCategory = await client.category.create({
                data: {
                    name,
                    description,
                },
            });
            if (parentId) {
                await client.categoryHierarchy.create({
                    data: {
                        ancestorId: parentId,
                        descendantId: newCategory.id,
                        depth: 1,
                    },
                });
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
        }
        catch (error) {
            console.error('Error creating category:', error);
            return {
                success: false,
                message: error.message || 'Error creating category',
                data: null,
            };
        }
    }
    async getCategoryHierarchy(storeDbUrl) {
        const client = this.prisma.getClient(storeDbUrl);
        try {
            const categories = await client.category.findMany({
                include: {
                    descendants: true,
                },
            });
            const hierarchy = (0, category_utils_1.buildHierarchy)(categories);
            return {
                success: true,
                message: 'Category hierarchy fetched successfully',
                data: hierarchy,
            };
        }
        catch (error) {
            console.error('Error fetching category hierarchy:', error);
            return {
                success: false,
                message: error.message || 'Error fetching category hierarchy',
                data: null,
            };
        }
    }
    async deleteCategory(storeDbUrl, id) {
        const client = this.prisma.getClient(storeDbUrl);
        try {
            const category = await client.category.findUnique({ where: { id } });
            if (!category) {
                return {
                    success: false,
                    message: 'Category not found',
                    data: null,
                };
            }
            await client.categoryHierarchy.deleteMany({
                where: { OR: [{ ancestorId: id }, { descendantId: id }] },
            });
            await client.category.delete({
                where: { id },
            });
            return {
                success: true,
                message: 'Category deleted successfully',
                data: null,
            };
        }
        catch (error) {
            console.error('Error deleting category:', error);
            return {
                success: false,
                message: error.message || 'Error deleting category',
                data: null,
            };
        }
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaDynamicService])
], CategoryService);
//# sourceMappingURL=category.service.js.map