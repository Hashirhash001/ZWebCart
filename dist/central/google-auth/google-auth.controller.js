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
exports.GoogleAuthController = void 0;
const common_1 = require("@nestjs/common");
const google_auth_service_1 = require("./google-auth.service");
const create_google_auth_dto_1 = require("./dto/create-google-auth.dto");
let GoogleAuthController = class GoogleAuthController {
    constructor(googleAuthService) {
        this.googleAuthService = googleAuthService;
    }
    async googleLogin(googleAuthDto) {
        return this.googleAuthService.googleAuth(googleAuthDto.token);
    }
};
exports.GoogleAuthController = GoogleAuthController;
__decorate([
    (0, common_1.Post)('google'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_google_auth_dto_1.GoogleAuthDto]),
    __metadata("design:returntype", Promise)
], GoogleAuthController.prototype, "googleLogin", null);
exports.GoogleAuthController = GoogleAuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [google_auth_service_1.GoogleAuthService])
], GoogleAuthController);
//# sourceMappingURL=google-auth.controller.js.map