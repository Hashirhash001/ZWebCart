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
exports.StoreAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_central_service_1 = require("../../prisma/prisma-central.service");
const bcrypt = require("bcrypt");
const child_process_1 = require("child_process");
const pg_1 = require("pg");
const dotenv = require("dotenv");
const crypto_utils_1 = require("../utils/crypto-utils");
const validator = require("validator");
const enum_log_utils_1 = require("../utils/enum-log-utils");
const generated_store_1 = require("../../../prisma/generated-store");
dotenv.config();
let StoreAuthService = class StoreAuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async logMessage(level = enum_log_utils_1.LogLevel.INFO, message, userId, context) {
        if (!Object.values(enum_log_utils_1.LogLevel).includes(level)) {
            console.warn('Invalid log level:', level);
            level = enum_log_utils_1.LogLevel.INFO;
        }
        await this.prisma.log.create({
            data: { level, message, userId, context },
        });
    }
    async registerStore(registerStoreDto) {
        const { email, password, name, currency, timezone, logoUrl } = registerStoreDto;
        const sanitizedEmail = validator.normalizeEmail(email.trim());
        const sanitizedPassword = password.trim();
        const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '_');
        if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
            throw new common_1.BadRequestException('Invalid email format');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: sanitizedEmail },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already in use');
        }
        const uniqueIdentifier = Date.now();
        const dbName = `${sanitizedName}_db_${uniqueIdentifier}`;
        const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5432/${dbName}`;
        const encryptedDbUrl = (0, crypto_utils_1.encrypt)(dbUrl);
        const decryptedDbUrl = (0, crypto_utils_1.decrypt)(encryptedDbUrl);
        let dbClient;
        let storeTransaction;
        try {
            dbClient = new pg_1.Client({
                user: process.env.DB_USER,
                host: 'localhost',
                password: process.env.DB_PASSWORD,
                port: 5432,
                database: 'postgres',
            });
            await dbClient.connect();
            console.log('Checking if the database already exists...');
            const res = await dbClient.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
            if (res.rows.length > 0) {
                throw new common_1.ConflictException(`Database ${dbName} already exists!`);
            }
            console.log(`Creating database: ${dbName}...`);
            await dbClient.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database ${dbName} created.`);
            storeTransaction = await this.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        email: sanitizedEmail,
                        password: await bcrypt.hash(sanitizedPassword, 10),
                        role: 'USER',
                        stores: {
                            create: {
                                name: sanitizedName,
                                dbName,
                                dbUrl: encryptedDbUrl,
                            },
                        },
                    },
                    include: { stores: true },
                });
                return user;
            });
            if (!storeTransaction) {
                throw new Error('Transaction failed. Store creation aborted.');
            }
            const user = storeTransaction;
            const storeId = user.stores[0].id;
            console.log('Running migrations...');
            const migrateCommand = `npx cross-env DATABASE_URL=${decryptedDbUrl} npx prisma migrate deploy --schema=prisma/schema.prisma`;
            (0, child_process_1.execSync)(migrateCommand, { stdio: 'inherit' });
            console.log('Migrations applied successfully.');
            const storePrisma = new generated_store_1.PrismaClient({
                datasources: { db: { url: decryptedDbUrl } },
            });
            console.log('Saving store settings...');
            await storePrisma.storeSettings.create({
                data: {
                    storeId,
                    storeName: user.stores[0].name,
                    currency: currency || 'USD',
                    timezone: timezone || 'UTC',
                    logoUrl: logoUrl || '',
                },
            });
            console.log('Store settings saved successfully.');
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                store: user.stores[0],
            };
            const accessToken = this.jwtService.sign(payload);
            return {
                success: true,
                message: 'Store and user registered successfully',
                data: {
                    accessToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        store: user.stores[0],
                    },
                },
            };
        }
        catch (error) {
            console.error('Error during store registration:', error);
            if (dbClient && dbName) {
                console.log(`Rolling back: Dropping database ${dbName}...`);
                await dbClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
                console.log('Database rollback complete.');
            }
            throw new common_1.InternalServerErrorException('Failed to register store', error.message);
        }
        finally {
            if (dbClient) {
                await dbClient.end();
            }
        }
    }
    async loginStore(loginStoreDto) {
        const { email, password } = loginStoreDto;
        let user;
        try {
            user = await this.prisma.user.findUnique({
                where: { email },
                include: { stores: true },
            });
            if (user && user.stores) {
                user.stores.forEach((store) => {
                    store.dbUrl = (0, crypto_utils_1.decrypt)(store.dbUrl);
                });
            }
        }
        catch (error) {
            console.error('Error finding user:', error);
            throw new common_1.InternalServerErrorException('Error finding user', 'User lookup failed');
        }
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new common_1.UnauthorizedException({
                success: false,
                message: 'Invalid email or password',
            });
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            store: user.stores[0],
        };
        const accessToken = this.jwtService.sign(payload);
        await this.logMessage(enum_log_utils_1.LogLevel.INFO, `Store owner logged in successfully`, user.id, { storeNames: user.stores.map((store) => store.name) });
        return {
            success: true,
            message: 'Login successful',
            data: {
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    stores: user.stores,
                },
            },
        };
    }
};
exports.StoreAuthService = StoreAuthService;
exports.StoreAuthService = StoreAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_central_service_1.PrismaCentralService,
        jwt_1.JwtService])
], StoreAuthService);
//# sourceMappingURL=store-auth.service.js.map