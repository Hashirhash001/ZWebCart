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
exports.WishlistController = void 0;
const common_1 = require("@nestjs/common");
const wishlist_service_1 = require("./wishlist.service");
const add_to_wishlist_dto_1 = require("./dtos/add-to-wishlist.dto");
const store_guard_1 = require("../guards/store.guard");
let WishlistController = class WishlistController {
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
    }
    async createWishlist(request, createWishlistDto) {
        const { storeId } = createWishlistDto;
        if (!storeId) {
            throw new common_1.BadRequestException('Store ID is required in the request body');
        }
        const storeDbUrl = request['storeDbUrl'];
        const userId = request['userId'];
        return this.wishlistService.createWishlist(storeDbUrl, userId, createWishlistDto);
    }
    async getWishlist(request, storeId) {
        if (!storeId) {
            throw new common_1.BadRequestException('Store ID is required in the request body');
        }
        const storeDbUrl = request['storeDbUrl'];
        const userId = request['userId'];
        return this.wishlistService.getWishlist(storeDbUrl, userId);
    }
    async deleteWishlist(request, id, storeId) {
        if (!storeId) {
            throw new common_1.BadRequestException('Store ID is required in the request body');
        }
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException('Invalid wishlist ID');
        }
        const storeDbUrl = request['storeDbUrl'];
        const userId = request['userId'];
        return this.wishlistService.deleteWishlist(storeDbUrl, userId, parsedId);
    }
    async moveToCartFromWishlist(request, storeId, productId, quantity = 1) {
        if (!storeId) {
            throw new common_1.BadRequestException('Store ID is required in the request body');
        }
        const storeDbUrl = request['storeDbUrl'];
        const userId = request['userId'];
        return this.wishlistService.moveToCartFromWishlist(storeDbUrl, userId, productId, quantity);
    }
};
exports.WishlistController = WishlistController;
__decorate([
    (0, common_1.Post)('/create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_to_wishlist_dto_1.AddToWishlistDto]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "createWishlist", null);
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "getWishlist", null);
__decorate([
    (0, common_1.Delete)('/:id/delete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "deleteWishlist", null);
__decorate([
    (0, common_1.Post)('/move-to-cart'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('storeId')),
    __param(2, (0, common_1.Body)('productId')),
    __param(3, (0, common_1.Body)('quantity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "moveToCartFromWishlist", null);
exports.WishlistController = WishlistController = __decorate([
    (0, common_1.Controller)('wishlist'),
    (0, common_1.UseGuards)(store_guard_1.StoreGuard),
    __metadata("design:paramtypes", [wishlist_service_1.WishlistService])
], WishlistController);
//# sourceMappingURL=wishlist.controller.js.map