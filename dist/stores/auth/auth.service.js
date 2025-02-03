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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const prisma_central_service_1 = require("../../prisma/prisma-central.service");
const bcrypt = require("bcrypt");
const crypto_utils_1 = require("../../central/utils/crypto-utils");
let AuthService = class AuthService {
    constructor(prismaCentral, prismaDynamic, jwtService) {
        this.prismaCentral = prismaCentral;
        this.prismaDynamic = prismaDynamic;
        this.jwtService = jwtService;
    }
    async getDatabaseUrl(storeId) {
        const store = await this.prismaCentral.store.findUnique({
            where: { id: String(storeId) },
        });
        if (!store) {
            throw new common_1.UnauthorizedException('Store not found');
        }
        const decryptedDbUrl = (0, crypto_utils_1.decrypt)(store.dbUrl);
        return decryptedDbUrl;
    }
    async login(storeId, loginUserDto) {
        const { email, password } = loginUserDto;
        const dbUrl = await this.getDatabaseUrl(storeId);
        const client = this.prismaDynamic.getClient(dbUrl);
        const user = await client.user.findUnique({ where: { email }, select: { id: true, email: true, password: true, role: true }, });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const payload = { sub: user.id, email: user.email, role: user.role, storeId };
        const accessToken = this.jwtService.sign(payload);
        return {
            success: true,
            message: 'Login successful',
            data: { accessToken, user },
        };
    }
    async register(storeId, registerUserDto) {
        const { email, password } = registerUserDto;
        const dbUrl = await this.getDatabaseUrl(storeId);
        const client = this.prismaDynamic.getClient(dbUrl);
        const existingUser = await client.user.findUnique({ where: { email }, select: { id: true, email: true, password: true, role: true }, });
        if (existingUser) {
            throw new common_1.ConflictException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await client.user.create({
            data: { email, password: hashedPassword, role: 'USER' },
            select: { id: true, email: true, role: true },
        });
        await client.log.create({
            data: { level: 'INFO', message: `User registered: ${email}`, userId: user.id },
        });
        const payload = { sub: user.id, email: user.email, role: user.role, storeId };
        const accessToken = this.jwtService.sign(payload);
        return {
            success: true,
            message: 'Registration successful',
            data: { accessToken, user },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_central_service_1.PrismaCentralService,
        prisma_service_1.PrismaDynamicService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map