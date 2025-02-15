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
exports.GoogleAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_central_service_1 = require("../../prisma/prisma-central.service");
const child_process_1 = require("child_process");
const pg_1 = require("pg");
const crypto_utils_1 = require("../utils/crypto-utils");
const generated_store_1 = require("../../../prisma/generated-store");
const nanoid_1 = require("nanoid");
const google_auth_library_1 = require("google-auth-library");
let GoogleAuthService = class GoogleAuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    async googleAuth(googleToken) {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload)
                throw new common_1.UnauthorizedException('Invalid Google token');
            const { email, name, picture, sub: googleId } = payload;
            let user = await this.prisma.user.findUnique({
                where: { email },
                include: { stores: true },
            });
            if (user) {
                const accessToken = this.jwtService.sign({
                    sub: user.id,
                    email: user.email,
                    role: user.role,
                    store: user.stores[0],
                });
                return {
                    success: true,
                    message: 'Login successful',
                    data: { accessToken, user },
                };
            }
            const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '_');
            const uniqueIdentifier = Date.now();
            const storeSlug = (0, nanoid_1.nanoid)(8);
            const storeUrl = `https://${storeSlug}.zcart.com`;
            const dbName = `${sanitizedName}_db_${uniqueIdentifier}`;
            const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5432/${dbName}`;
            const encryptedDbUrl = (0, crypto_utils_1.encrypt)(dbUrl);
            const decryptedDbUrl = (0, crypto_utils_1.decrypt)(encryptedDbUrl);
            const dbClient = new pg_1.Client({
                user: process.env.DB_USER,
                host: 'localhost',
                password: process.env.DB_PASSWORD,
                port: 5432,
                database: 'postgres',
            });
            await dbClient.connect();
            await dbClient.query(`CREATE DATABASE "${dbName}"`);
            (0, child_process_1.execSync)(`npx cross-env DATABASE_URL=${decryptedDbUrl} npx prisma migrate deploy --schema=prisma/schema.prisma`, {
                stdio: 'inherit',
            });
            user = await this.prisma.$transaction(async (prisma) => prisma.user.create({
                data: {
                    email,
                    googleId,
                    provider: 'google',
                    name,
                    avatarUrl: picture,
                    role: 'USER',
                    stores: {
                        create: {
                            name: sanitizedName,
                            dbName,
                            dbUrl: encryptedDbUrl,
                            storeUrl,
                        },
                    },
                },
                include: { stores: true },
            }));
            const storePrisma = new generated_store_1.PrismaClient({
                datasources: { db: { url: decryptedDbUrl } },
            });
            await storePrisma.storeSettings.create({
                data: {
                    storeId: user.stores[0].id,
                    storeName: sanitizedName,
                    currency: 'USD',
                    timezone: 'UTC',
                    logoUrl: picture ?? '',
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
                    ThemeVersion: { create: { version: 1, config: {}, isDefault: true } },
                },
            });
            console.log('Default theme assigned successfully.');
            console.log('Creating default pages and sections...');
            const pages = [
                {
                    title: 'Home',
                    slug: 'home',
                    sections: ['Hero', 'Featured Products', 'Testimonials'],
                },
                {
                    title: 'Products',
                    slug: 'products',
                    sections: ['Product List', 'Filters'],
                },
                {
                    title: 'Product Details',
                    slug: 'product-details',
                    sections: ['Product Images', 'Description', 'Reviews'],
                },
                {
                    title: 'Contact',
                    slug: 'contact',
                    sections: ['Contact Form', 'Map', 'Social Links'],
                },
                { title: 'Login', slug: 'login', sections: ['Login Form'] },
                {
                    title: 'Register',
                    slug: 'register',
                    sections: ['Registration Form'],
                },
                { title: 'Cart', slug: 'cart', sections: ['Cart'] },
                { title: 'Checkout', slug: 'checkout', sections: ['Checkout'] },
            ];
            const globalSections = [
                { type: 'Header', title: 'Main Header', isGlobal: true },
                { type: 'Footer', title: 'Main Footer', isGlobal: true },
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
                        logoPosition: 'left',
                        menuStyle: 'horizontal',
                        showSearch: true,
                        backgroundColor: '#ffffff',
                        sticky: true,
                    },
                    content: {
                        logoUrl: '/assets/logo.png',
                        menuItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Products', url: '/products' },
                            { label: 'Contact', url: '/contact' },
                        ],
                        cartIcon: true,
                        accountDropdown: true,
                    },
                },
                Footer: {
                    config: {
                        layout: 'columns',
                        backgroundColor: '#333',
                        textColor: '#ffffff',
                        showNewsletterSignup: true,
                    },
                    content: {
                        logoUrl: '/assets/logo.png',
                        copyrightText: '© 2025 My Store. All rights reserved.',
                        links: [
                            { label: 'Privacy Policy', url: '/privacy' },
                            { label: 'Terms of Service', url: '/terms' },
                        ],
                        socialMedia: [
                            { platform: 'Facebook', url: 'https://facebook.com/mystore' },
                            { platform: 'Instagram', url: 'https://instagram.com/mystore' },
                        ],
                    },
                },
                Hero: {
                    config: { backgroundColor: '#fff', textAlignment: 'center' },
                    content: {
                        title: 'Welcome to our store!',
                        subtitle: 'Discover amazing products',
                        buttonText: 'Shop Now',
                        buttonLink: '/products',
                        imageUrl: '/banners/hero.jpg',
                    },
                },
                'Featured Products': {
                    config: { layout: 'grid', maxItems: 8 },
                    content: { productIds: [] },
                },
                Testimonials: {
                    config: { layout: 'carousel', autoScroll: true },
                    content: { testimonials: [] },
                },
                'Product List': {
                    config: { filterTypes: ['category', 'price', 'brand', 'rating'] },
                    content: {},
                },
                Filters: {
                    config: { allowRatings: true, showStockStatus: true },
                    content: {},
                },
                'Product Images': {
                    config: {},
                    content: { images: [], mainImageIndex: 0 },
                },
                Description: {
                    config: {},
                    content: { text: '', showReadMore: true },
                },
                Reviews: {
                    config: {},
                    content: { reviews: [], allowCustomerImages: true },
                },
                'Contact Form': {
                    config: {},
                    content: {
                        fields: ['name', 'email', 'message'],
                        enableCaptcha: true,
                    },
                },
                Map: {
                    config: {},
                    content: { location: { lat: 0, lng: 0 }, zoomLevel: 12 },
                },
                'Social Links': {
                    config: {},
                    content: {
                        links: [
                            { platform: 'Facebook', url: '' },
                            { platform: 'Instagram', url: '' },
                        ],
                    },
                },
                'Login Form': {
                    config: {},
                    content: {},
                },
                'Registration Form': {
                    config: {},
                    content: {},
                },
                Cart: {
                    config: { allowCoupons: true, showEstimatedShipping: true },
                    content: { items: [], totalPrice: 0 },
                },
                Checkout: {
                    config: { allowGuestCheckout: true, showOrderSummary: true },
                    content: {
                        paymentMethods: ['Credit Card', 'PayPal'],
                        shippingOptions: [],
                    },
                },
            };
            for (const page of pages) {
                const createdPage = await storePrisma.page.create({
                    data: {
                        title: page.title,
                        slug: page.slug,
                        themeId: theme.id,
                        config: {},
                        PageVersion: {
                            create: {
                                version: 1,
                                config: {},
                                sections: {},
                                isPublished: true,
                            },
                        },
                    },
                });
                for (const [index, section] of page.sections.entries()) {
                    const sectionData = sectionConfigs[section] || {
                        config: {},
                        content: {},
                    };
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
            const accessToken = this.jwtService.sign({
                sub: user.id,
                email: user.email,
                role: user.role,
                store: user.stores[0],
            });
            return {
                success: true,
                message: 'Google authentication successful',
                data: { accessToken, user },
            };
        }
        catch (error) {
            console.error('Error during Google authentication:', error);
            throw new common_1.InternalServerErrorException('Failed to authenticate via Google');
        }
    }
};
exports.GoogleAuthService = GoogleAuthService;
exports.GoogleAuthService = GoogleAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_central_service_1.PrismaCentralService,
        jwt_1.JwtService])
], GoogleAuthService);
//# sourceMappingURL=google-auth.service.js.map