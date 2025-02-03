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
exports.StoreAuthController = void 0;
const common_1 = require("@nestjs/common");
const register_store_dto_1 = require("./dtos/register-store.dto");
const login_store_dto_1 = require("./dtos/login-store.dto");
const store_auth_service_1 = require("./store-auth.service");
let StoreAuthController = class StoreAuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerStoreDto) {
        return this.authService.registerStore(registerStoreDto);
    }
    async login(loginStoreDto) {
        return this.authService.loginStore(loginStoreDto);
    }
};
exports.StoreAuthController = StoreAuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_store_dto_1.RegisterStoreDto]),
    __metadata("design:returntype", Promise)
], StoreAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_store_dto_1.LoginStoreDto]),
    __metadata("design:returntype", Promise)
], StoreAuthController.prototype, "login", null);
exports.StoreAuthController = StoreAuthController = __decorate([
    (0, common_1.Controller)('central/auth'),
    __metadata("design:paramtypes", [store_auth_service_1.StoreAuthService])
], StoreAuthController);
//# sourceMappingURL=store-auth.controller.js.map