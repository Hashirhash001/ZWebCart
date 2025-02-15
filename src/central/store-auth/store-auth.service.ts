import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
import * as bcrypt from 'bcrypt';
import { execSync } from 'child_process';
import { Client } from 'pg';
import { RegisterStoreDto } from './dtos/register-store.dto';
import { LoginStoreDto } from './dtos/login-store.dto';
import * as dotenv from 'dotenv';
import { encrypt, decrypt } from '../utils/crypto-utils'; // Import encrypt and decrypt functions
import * as validator from 'validator';
import { LogLevel } from 'src/central/utils/enum-log-utils';
import { PrismaClient } from '../../../prisma/generated-store';
import { nanoid } from 'nanoid';   

// Load environment variables from .env file
dotenv.config();

@Injectable()
export class StoreAuthService {
  constructor(
    private prisma: PrismaCentralService,
    private jwtService: JwtService,
  ) {}

  private async logMessage(
    level: LogLevel = LogLevel.INFO, // Default to INFO
    message: string,
    userId?: string,
    context?: any,
  ) {
    if (!Object.values(LogLevel).includes(level)) {
      console.warn('Invalid log level:', level);
      level = LogLevel.INFO;
    }
  
    await this.prisma.log.create({
      data: { level, message, userId, context },
    });
  }  

  // Register a new store with its owner
  async registerStore(registerStoreDto: RegisterStoreDto) {
    const { email, password, name, currency, timezone, logoUrl } = registerStoreDto;

    // Input sanitization and validation
    const sanitizedEmail = validator.normalizeEmail(email.trim());
    const sanitizedPassword = password.trim();
    const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '_');

    // Validate email format
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
        throw new BadRequestException('Invalid email format');
    }

    // Check if the user already exists
    const existingUser = await this.prisma.user.findUnique({
        where: { email: sanitizedEmail },
    });
    if (existingUser) {
        throw new ConflictException('Email already in use');
    }

    // Generate a unique database name for the store
    const uniqueIdentifier = Date.now();
    const storeSlug = nanoid(8);
    const storeUrl = `https://${storeSlug}.zcart.com`;
    const dbName = `${sanitizedName}_db_${uniqueIdentifier}`;
    const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5433/${dbName}`;
    const encryptedDbUrl = encrypt(dbUrl);
    const decryptedDbUrl = decrypt(encryptedDbUrl);

    let dbClient;
    let userTransaction;

    try {
        // Connect to the main PostgreSQL database
        dbClient = new Client({
            user: process.env.DB_USER,
            host: 'localhost',
            password: process.env.DB_PASSWORD,
            port: 5433,
            database: 'postgres',
        });

        await dbClient.connect();

        // Check if the database already exists
        console.log('Checking if the database already exists...');
        const res = await dbClient.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
        if (res.rows.length > 0) {
            throw new ConflictException(`Database ${dbName} already exists!`);
        }

        // Create a new database for the store
        console.log(`Creating database: ${dbName}...`);
        await dbClient.query(`CREATE DATABASE "${dbName}"`);
        console.log(`Database ${dbName} created.`);

        // Run database migrations
        console.log('Running migrations...');
        try {
            const migrateCommand = `npx cross-env DATABASE_URL=${decryptedDbUrl} npx prisma migrate deploy --schema=prisma/schema.prisma`;
            execSync(migrateCommand, { stdio: 'inherit' });
            console.log('Migrations applied successfully.');
        } catch (migrationError) {
            console.error('Migration failed:', migrationError);

            // Rollback by dropping the database if migration fails
            console.log(`Rolling back: Dropping database ${dbName}...`);
            await dbClient.$disconnect();
            await dbClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
            console.log('Database rollback complete.');

            throw new InternalServerErrorException('Database migration failed', migrationError.message);
        }

        // Create the user and store entry in the main database
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

        // Connect to the newly created store database
        const storePrisma = new PrismaClient({
            datasources: { db: { url: decryptedDbUrl } },
        });

        // Save store settings
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

        // Assign a default theme to the store
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

        // Create default pages with sections
        // -------------------------------
        // This code creates the default pages (Home, Products, Product Details, Contact, Login, Register)
        // and their sections (Hero, Featured Products, Testimonials, Product List, Filters, Product Images, Description, Reviews, Contact Form, Map, Social Links, Login Form, Registration Form)
        //
        // The sections are created in order of their index in the array, and the order is set to the index + 1
        // The config and content of the sections are empty by default
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
        
        // Global sections (Header & Footer)
        const globalSections = [
          { type: 'Header', title: 'Main Header', isGlobal: true },
          { type: 'Footer', title: 'Main Footer', isGlobal: true }
        ];
        
        // Create Global Sections
        for (const section of globalSections) {
          await storePrisma.section.create({
              data: {
                  type: section.type,
                  title: section.title,
                  isGlobal: section.isGlobal,
                  order: 0, // Global sections do not have an order within a page
                  config: {},
                  content: {},
                  page: undefined, // Ensure it's not trying to reference a page
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
        
        // Page & Section Creation
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

        // Create a JWT token for authentication
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
    } catch (error) {
        console.error('Error during store registration:', error);

        throw new InternalServerErrorException('Failed to register store', error.message);
    } finally {
        if (dbClient) {
            await dbClient.end();
        }
    }
  }  

  // Login store owner
  async loginStore(loginStoreDto: LoginStoreDto) {
    const { email, password } = loginStoreDto;

    // Find the user (store owner)
    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { email },
        include: { stores: true }, // Include associated stores
      });

      // Decrypt dbUrl for each store
      if (user && user.stores) {
        user.stores.forEach((store) => {
          store.dbUrl = decrypt(store.dbUrl); // Decrypt the dbUrl for use
        });
      }
    } catch (error) {
      console.error('Error finding user:', error);
      throw new InternalServerErrorException(
        'Error finding user',
        'User lookup failed',
      );
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Create a JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      store: user.stores[0],
    };
    const accessToken = this.jwtService.sign(payload);

    // Log the successful login
    await this.logMessage(
      LogLevel.INFO,
      `Store owner logged in successfully`,
      user.id,
      { storeNames: user.stores.map((store) => store.name) },
    );

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
}
