"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesModule = void 0;
const common_1 = require("@nestjs/common");
const pages_service_1 = require("./pages.service");
const pages_controller_1 = require("./pages.controller");
const prisma_service_1 = require("../../../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const prisma_central_service_1 = require("../../../prisma/prisma-central.service");
let PagesModule = class PagesModule {
};
exports.PagesModule = PagesModule;
exports.PagesModule = PagesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '7d' },
            }),
        ],
        controllers: [pages_controller_1.PagesController],
        providers: [pages_service_1.PagesService, prisma_service_1.PrismaDynamicService, prisma_central_service_1.PrismaCentralService],
    })
], PagesModule);
//# sourceMappingURL=pages.module.js.map