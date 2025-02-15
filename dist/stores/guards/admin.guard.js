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
exports.AdminGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_central_service_1 = require("../../prisma/prisma-central.service");
const crypto_utils_1 = require("../../central/utils/crypto-utils");
let AdminGuard = class AdminGuard {
    constructor(jwtService, prismaCentral) {
        this.jwtService = jwtService;
        this.prismaCentral = prismaCentral;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization']?.split(' ')[1];
        if (!token) {
            throw new common_1.UnauthorizedException('Authorization token is required');
        }
        try {
            const decoded = this.jwtService.verify(token);
            if (decoded.exp < Date.now() / 1000) {
                throw new common_1.ForbiddenException('Token is expired');
            }
            const storeId = decoded.store?.id;
            if (!storeId) {
                throw new common_1.ForbiddenException('Store ID is missing in the token');
            }
            const store = await this.prismaCentral.store.findUnique({
                where: { id: storeId },
            });
            if (!store) {
                throw new common_1.ForbiddenException('Store not found');
            }
            const decryptedDbUrl = (0, crypto_utils_1.decrypt)(store.dbUrl);
            request['storeId'] = storeId;
            request['storeDbUrl'] = decryptedDbUrl;
            return true;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new common_1.ForbiddenException('Token is expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new common_1.ForbiddenException('Invalid token');
            }
            throw error;
        }
    }
};
exports.AdminGuard = AdminGuard;
exports.AdminGuard = AdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_central_service_1.PrismaCentralService])
], AdminGuard);
//# sourceMappingURL=admin.guard.js.map