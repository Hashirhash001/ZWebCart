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
exports.CollectionsController = void 0;
const common_1 = require("@nestjs/common");
const collections_service_1 = require("./collections.service");
const create_collection_dto_1 = require("./dtos/create-collection.dto");
const frontStore_guard_1 = require("../guards/frontStore.guard");
const admin_guard_1 = require("../guards/admin.guard");
let CollectionsController = class CollectionsController {
    constructor(collectionsService) {
        this.collectionsService = collectionsService;
    }
    async createCollection(request, dto) {
        const storeDbUrl = request['storeDbUrl'];
        return this.collectionsService.createCollection(dto, storeDbUrl);
    }
    async getAllCollections(request) {
        const storeDbUrl = request['storeDbUrl'];
        return this.collectionsService.getAllCollections(storeDbUrl);
    }
    async getCollection(request, id) {
        const storeDbUrl = request['storeDbUrl'];
        return this.collectionsService.getCollectionById(id, storeDbUrl);
    }
    async addProducts(request, id, dto) {
        const storeDbUrl = request['storeDbUrl'];
        return this.collectionsService.addProductsToCollection(id, dto, storeDbUrl);
    }
};
exports.CollectionsController = CollectionsController;
__decorate([
    (0, common_1.Post)('/create'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, create_collection_dto_1.CreateCollectionDto]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "createCollection", null);
__decorate([
    (0, common_1.Get)('/'),
    (0, common_1.UseGuards)(frontStore_guard_1.FrontStoreGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getAllCollections", null);
__decorate([
    (0, common_1.Get)('/:id'),
    (0, common_1.UseGuards)(frontStore_guard_1.FrontStoreGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Number]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getCollection", null);
__decorate([
    (0, common_1.Post)('/:id/products'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Number, create_collection_dto_1.AddProductsToCollectionDto]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "addProducts", null);
exports.CollectionsController = CollectionsController = __decorate([
    (0, common_1.Controller)('store/collections'),
    __metadata("design:paramtypes", [collections_service_1.CollectionsService])
], CollectionsController);
//# sourceMappingURL=collections.controller.js.map