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
const nanoid_1 = require("nanoid");
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
        const storeSlug = (0, nanoid_1.nanoid)(8);
        const storeUrl = `https://${storeSlug}.zcart.com`;
        const dbName = `${sanitizedName}_db_${uniqueIdentifier}`;
        const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5433/${dbName}`;
        const encryptedDbUrl = (0, crypto_utils_1.encrypt)(dbUrl);
        const decryptedDbUrl = (0, crypto_utils_1.decrypt)(encryptedDbUrl);
        let dbClient;
        let userTransaction;
        try {
            dbClient = new pg_1.Client({
                user: process.env.DB_USER,
                host: 'localhost',
                password: process.env.DB_PASSWORD,
                port: 5433,
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
            console.log('Running migrations...');
            try {
                const migrateCommand = `npx cross-env DATABASE_URL=${decryptedDbUrl} npx prisma migrate deploy --schema=prisma/schema.prisma`;
                (0, child_process_1.execSync)(migrateCommand, { stdio: 'inherit' });
                console.log('Migrations applied successfully.');
            }
            catch (migrationError) {
                console.error('Migration failed:', migrationError);
                console.log(`Rolling back: Dropping database ${dbName}...`);
                await dbClient.$disconnect();
                await dbClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
                console.log('Database rollback complete.');
                throw new common_1.InternalServerErrorException('Database migration failed', migrationError.message);
            }
            userTransaction = await this.prisma.$transaction(async (prisma) => {
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
                                storeUrl
                            },
                        },
                    },
                    include: { stores: true },
                });
                return user;
            });
            if (!userTransaction) {
                throw new Error('Transaction failed. Store creation aborted.');
            }
            const user = userTransaction;
            const storeId = user.stores[0].id;
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
            console.log(`Assigning default theme to store.`);
            const theme = await storePrisma.theme.create({
                data: {
                    name: 'Default Theme',
                    currentVersion: 1,
                    templateUrl: '/themes/default',
                    isActive: true,
                    ThemeVersion: {
                        create: {
                            version: 1,
                            config: {},
                            isDefault: true,
                        },
                    },
                },
            });
            console.log('Default theme assigned successfully.');
            console.log('Creating default pages and sections...');
            const pages = [
                { title: 'Home', slug: 'home', sections: ['Hero', 'Featured Products', 'Testimonials'] },
                { title: 'Products', slug: 'products', sections: ['Product List', 'Filters'] },
                { title: 'Product Details', slug: 'product-details', sections: ['Product Images', 'Description', 'Reviews'] },
                { title: 'Contact', slug: 'contact', sections: ['Contact Form', 'Map', 'Social Links'] },
                { title: 'Login', slug: 'login', sections: ['Login Form'] },
                { title: 'Register', slug: 'register', sections: ['Registration Form'] },
                { title: 'Cart', slug: 'cart', sections: ['Cart'] },
                { title: 'Checkout', slug: 'checkout', sections: ['Checkout'] }
            ];
            const globalSections = [
                { type: 'Header', title: 'Main Header', isGlobal: true },
                { type: 'Footer', title: 'Main Footer', isGlobal: true }
            ];
            for (const section of globalSections) {
                await storePrisma.section.create({
                    data: {
                        type: section.type,
                        title: section.title,
                        isGlobal: section.isGlobal,
                        order: 0,
                        config: {},
                        content: {},
                        page: undefined,
                    },
                });
            }
            const sectionConfigs = {
                Header: {
                    config: {
                        logoPosition: "left",
                        menuStyle: "horizontal",
                        showSearch: true,
                        backgroundColor: "#ffffff",
                        sticky: true
                    },
                    content: {
                        logoUrl: "/assets/logo.png",
                        menuItems: [
                            { label: "Home", url: "/" },
                            { label: "Products", url: "/products" },
                            { label: "Contact", url: "/contact" }
                        ],
                        cartIcon: true,
                        accountDropdown: true
                    }
                },
                Footer: {
                    config: {
                        layout: "columns",
                        backgroundColor: "#333",
                        textColor: "#ffffff",
                        showNewsletterSignup: true
                    },
                    content: {
                        logoUrl: "/assets/logo.png",
                        copyrightText: "© 2025 My Store. All rights reserved.",
                        links: [
                            { label: "Privacy Policy", url: "/privacy" },
                            { label: "Terms of Service", url: "/terms" }
                        ],
                        socialMedia: [
                            { platform: "Facebook", url: "https://facebook.com/mystore" },
                            { platform: "Instagram", url: "https://instagram.com/mystore" }
                        ]
                    }
                },
                Hero: {
                    config: { backgroundColor: "#fff", textAlignment: "center" },
                    content: {
                        title: "Welcome to our store!",
                        subtitle: "Discover amazing products",
                        buttonText: "Shop Now",
                        buttonLink: "/products",
                        imageUrl: "/banners/hero.jpg"
                    }
                },
                "Featured Products": {
                    config: { layout: "grid", maxItems: 8 },
                    content: { productIds: [] }
                },
                Testimonials: {
                    config: { layout: "carousel", autoScroll: true },
                    content: { testimonials: [] }
                },
                "Product List": {
                    config: { filterTypes: ["category", "price", "brand", "rating"] },
                    content: {}
                },
                Filters: {
                    config: { allowRatings: true, showStockStatus: true },
                    content: {}
                },
                "Product Images": {
                    config: {},
                    content: { images: [], mainImageIndex: 0 }
                },
                Description: {
                    config: {},
                    content: { text: "", showReadMore: true }
                },
                Reviews: {
                    config: {},
                    content: { reviews: [], allowCustomerImages: true }
                },
                "Contact Form": {
                    config: {},
                    content: { fields: ["name", "email", "message"], enableCaptcha: true }
                },
                Map: {
                    config: {},
                    content: { location: { lat: 0, lng: 0 }, zoomLevel: 12 }
                },
                "Social Links": {
                    config: {},
                    content: { links: [{ platform: "Facebook", url: "" }, { platform: "Instagram", url: "" }] }
                },
                "Login Form": {
                    config: {},
                    content: {}
                },
                "Registration Form": {
                    config: {},
                    content: {}
                },
                Cart: {
                    config: { allowCoupons: true, showEstimatedShipping: true },
                    content: { items: [], totalPrice: 0 }
                },
                Checkout: {
                    config: { allowGuestCheckout: true, showOrderSummary: true },
                    content: { paymentMethods: ["Credit Card", "PayPal"], shippingOptions: [] }
                }
            };
            for (const page of pages) {
                const createdPage = await storePrisma.page.create({
                    data: {
                        title: page.title,
                        slug: page.slug,
                        themeId: theme.id,
                        config: {},
                        PageVersion: { create: { version: 1, config: {}, sections: {}, isPublished: true } },
                    },
                });
                for (const [index, section] of page.sections.entries()) {
                    const sectionData = sectionConfigs[section] || { config: {}, content: {} };
                    await storePrisma.section.create({
                        data: {
                            pageId: createdPage.id,
                            type: section,
                            order: index + 1,
                            config: sectionData.config,
                            content: sectionData.content,
                        },
                    });
                }
            }
            console.log('Default pages and sections created successfully.');
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