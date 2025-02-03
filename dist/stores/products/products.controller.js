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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dtos/create-product.dto");
const update_product_dto_1 = require("./dtos/update-product.dto");
const admin_guard_1 = require("../guards/admin.guard");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const multer_1 = require("multer");
const frontStore_guard_1 = require("../guards/frontStore.guard");
const filter_product_dto_1 = require("./dtos/filter-product.dto");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILE_COUNT = 10;
const UPLOADS_DIR = './uploads';
const multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: UPLOADS_DIR,
        filename: (req, file, callback) => {
            callback(null, `${Date.now()}-${file.originalname}`);
        },
    }),
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
            return callback(new common_1.BadRequestException('Only image files are allowed'), false);
        }
        callback(null, true);
    },
};
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async validateDto(dtoClass, body) {
        const transformedDto = (0, class_transformer_1.plainToInstance)(dtoClass, body);
        const errors = await (0, class_validator_1.validate)(transformedDto);
        if (errors.length > 0) {
            throw new common_1.BadRequestException(errors.map((err) => Object.values(err.constraints)).flat());
        }
        return transformedDto;
    }
    parseAndValidateBody(body) {
        if (typeof body.price === 'string') {
            const parsedPrice = Number(body.price.replace(/,/g, ''));
            if (isNaN(parsedPrice)) {
                throw new common_1.BadRequestException('Invalid format: price must be a number');
            }
            body.price = parsedPrice;
        }
        if (typeof body.comparePrice === 'string') {
            const parsedComparePrice = Number(body.comparePrice.replace(/,/g, ''));
            if (isNaN(parsedComparePrice)) {
                throw new common_1.BadRequestException('Invalid format: comparePrice must be a number');
            }
            body.comparePrice = parsedComparePrice;
        }
        if (typeof body.categoryId === 'string') {
            const parsedCategoryId = Number(body.categoryId);
            if (isNaN(parsedCategoryId)) {
                throw new common_1.BadRequestException('Invalid format: categoryId must be a number');
            }
            body.categoryId = parsedCategoryId;
        }
        if (typeof body.stock === 'string') {
            const parsedStock = Number(body.stock);
            if (isNaN(parsedStock)) {
                throw new common_1.BadRequestException('Invalid format: stock must be a number');
            }
            body.stock = parsedStock;
        }
        if (typeof body.attributes === 'string') {
            try {
                const parsedAttributes = JSON.parse(body.attributes);
                if (!Array.isArray(parsedAttributes)) {
                    throw new common_1.BadRequestException('Attributes must be an array of objects');
                }
                parsedAttributes.forEach((attr, index) => {
                    if (typeof attr !== 'object' ||
                        !attr.hasOwnProperty('key') ||
                        !attr.hasOwnProperty('value') ||
                        typeof attr.key !== 'string' ||
                        typeof attr.value !== 'string') {
                        throw new common_1.BadRequestException(`Invalid attribute format at index ${index}. Each attribute must have "key" and "value" as strings.`);
                    }
                });
                body.attributes = parsedAttributes;
            }
            catch (error) {
                throw new common_1.BadRequestException('Invalid JSON format for attributes');
            }
        }
    }
    async createProduct(request, body, files) {
        if (!body) {
            throw new common_1.BadRequestException('Request body is missing');
        }
        this.parseAndValidateBody(body);
        const createProductDto = await this.validateDto(create_product_dto_1.CreateProductDto, body);
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No images provided');
        }
        return this.productsService.createProduct(request['storeDbUrl'], createProductDto, files);
    }
    async updateProduct(request, id, body, files) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException('Invalid product ID');
        }
        this.parseAndValidateBody(body);
        const updateProductDto = await this.validateDto(update_product_dto_1.UpdateProductDto, body);
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No images provided');
        }
        const storeDbUrl = request['storeDbUrl'];
        return this.productsService.updateProduct(storeDbUrl, parsedId, updateProductDto, files);
    }
    async getAllProducts(request) {
        const storeDbUrl = request['storeDbUrl'];
        return this.productsService.getProducts(storeDbUrl);
    }
    async getProduct(request, id) {
        const storeDbUrl = request['storeDbUrl'];
        return this.productsService.getProduct(storeDbUrl, id);
    }
    async deleteProduct(request, id) {
        const storeDbUrl = request['storeDbUrl'];
        return this.productsService.deleteProduct(storeDbUrl, id);
    }
    async fetchProductsByCategory(request, categoryId) {
        const storeDbUrl = request['storeDbUrl'];
        return this.productsService.filterProductsByCategory(storeDbUrl, categoryId);
    }
    async filterProducts(filterDto, request) {
        const { minPrice, maxPrice, attributes } = filterDto;
        const storeDbUrl = request['storeDbUrl'];
        return this.productsService.filterProductsByPriceAndAttributes(storeDbUrl, minPrice, maxPrice, attributes);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)('/create'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', MAX_FILE_COUNT, multerConfig)),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Put)('/update/:id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', MAX_FILE_COUNT, multerConfig)),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Get)('/all'),
    (0, common_1.UseGuards)(frontStore_guard_1.FrontStoreGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getAllProducts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(frontStore_guard_1.FrontStoreGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Delete)(':id/delete'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('/filter-by-category/:categoryId'),
    (0, common_1.UseGuards)(frontStore_guard_1.FrontStoreGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "fetchProductsByCategory", null);
__decorate([
    (0, common_1.Post)('/filter'),
    (0, common_1.UseGuards)(frontStore_guard_1.FrontStoreGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_product_dto_1.FilterProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "filterProducts", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('store/product'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map