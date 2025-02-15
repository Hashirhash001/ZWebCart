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
exports.ThemesController = void 0;
const common_1 = require("@nestjs/common");
const themes_service_1 = require("./themes.service");
const create_theme_dto_1 = require("./dtos/create-theme.dto");
const update_theme_dto_1 = require("./dtos/update-theme.dto");
const admin_guard_1 = require("../../guards/admin.guard");
let ThemesController = class ThemesController {
    constructor(themesService) {
        this.themesService = themesService;
    }
    async createTheme(request, body) {
        return this.themesService.createTheme(request['storeDbUrl'], request['storeId'], body);
    }
    async getAllThemes(request) {
        return this.themesService.getThemes(request['storeDbUrl']);
    }
    async getTheme(request, id) {
        return this.themesService.getTheme(request['storeDbUrl'], id);
    }
    async updateTheme(request, id, body) {
        return this.themesService.updateTheme(request['storeDbUrl'], id, body);
    }
    async deleteTheme(request, id) {
        return this.themesService.deleteTheme(request['storeDbUrl'], id);
    }
};
exports.ThemesController = ThemesController;
__decorate([
    (0, common_1.Post)('/create'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_theme_dto_1.CreateThemeDto]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "createTheme", null);
__decorate([
    (0, common_1.Get)('/all'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "getAllThemes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "getTheme", null);
__decorate([
    (0, common_1.Put)('/update/:id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_theme_dto_1.UpdateThemeDto]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "updateTheme", null);
__decorate([
    (0, common_1.Delete)(':id/delete'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "deleteTheme", null);
exports.ThemesController = ThemesController = __decorate([
    (0, common_1.Controller)('store/themes'),
    __metadata("design:paramtypes", [themes_service_1.ThemesService])
], ThemesController);
//# sourceMappingURL=themes.controller.js.map