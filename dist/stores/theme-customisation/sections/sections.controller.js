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
exports.SectionsController = void 0;
const common_1 = require("@nestjs/common");
const sections_service_1 = require("./sections.service");
const create_section_dto_1 = require("./dtos/create-section.dto");
const update_section_dto_1 = require("./dtos/update-section.dto");
const admin_guard_1 = require("../../guards/admin.guard");
let SectionsController = class SectionsController {
    constructor(sectionsService) {
        this.sectionsService = sectionsService;
    }
    async create(request, createSectionDto) {
        return this.sectionsService.create(request['storeDbUrl'], request['storeId'], createSectionDto);
    }
    async findAll(request) {
        return this.sectionsService.findAll(request['storeDbUrl']);
    }
    async findByTheme(request, themeId) {
        return this.sectionsService.findByTheme(request['storeDbUrl'], Number(themeId));
    }
    async findByPage(request, pageId) {
        return this.sectionsService.findByPage(request['storeDbUrl'], Number(pageId));
    }
    async update(request, id, updateSectionDto) {
        return this.sectionsService.update(request['storeDbUrl'], Number(id), updateSectionDto);
    }
    async delete(request, id) {
        return this.sectionsService.delete(request['storeDbUrl'], Number(id));
    }
};
exports.SectionsController = SectionsController;
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_section_dto_1.CreateSectionDto]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('theme/:themeId'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('themeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "findByTheme", null);
__decorate([
    (0, common_1.Get)('page/:pageId'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('pageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "findByPage", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_section_dto_1.UpdateSectionDto]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "delete", null);
exports.SectionsController = SectionsController = __decorate([
    (0, common_1.Controller)('/store/sections'),
    __metadata("design:paramtypes", [sections_service_1.SectionsService])
], SectionsController);
//# sourceMappingURL=sections.controller.js.map