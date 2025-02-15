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
import * as dotenv from 'dotenv';
import { encrypt, decrypt } from '../utils/crypto-utils';
import * as validator from 'validator';
import { LogLevel } from 'src/central/utils/enum-log-utils';
import { PrismaClient } from '../../../prisma/generated-store';
import { nanoid } from 'nanoid';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private prisma: PrismaCentralService,
    private jwtService: JwtService,
  ) {}

  async googleAuth(googleToken: string) {
    try {
    //   console.log('Google token:', googleToken);
    //   console.log('Google client ID:', process.env.GOOGLE_CLIENT_ID);

      // Verify Google token
      const ticket = await this.client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid Google token');

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

      // New User Registration
      const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '_');
      const uniqueIdentifier = Date.now();
      const storeSlug = nanoid(8);
      const storeUrl = `https://${storeSlug}.zcart.com`;
      const dbName = `${sanitizedName}_db_${uniqueIdentifier}`;
      const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5432/${dbName}`;
      const encryptedDbUrl = encrypt(dbUrl);
      const decryptedDbUrl = decrypt(encryptedDbUrl);

      const dbClient = new Client({
        user: process.env.DB_USER,
        host: 'localhost',
        password: process.env.DB_PASSWORD,
        port: 5432,
        database: 'postgres',
      });

      await dbClient.connect();
      await dbClient.query(`CREATE DATABASE "${dbName}"`);

      execSync(
        `npx cross-env DATABASE_URL=${decryptedDbUrl} npx prisma migrate deploy --schema=prisma/schema.prisma`,
        {
          stdio: 'inherit',
        },
      );

      user = await this.prisma.$transaction(async (prisma) =>
        prisma.user.create({
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
        }),
      );

      const storePrisma = new PrismaClient({
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

      // Assign a default theme to the store
      console.log(`Assigning default theme to store.`);

      // Assign a default theme
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

      // Create default pages with sections
      // -------------------------------
      // This code creates the default pages (Home, Products, Product Details, Contact, Login, Register)
      // and their sections (Hero, Featured Products, Testimonials, Product List, Filters, Product Images, Description, Reviews, Contact Form, Map, Social Links, Login Form, Registration Form)
      //
      // The sections are created in order of their index in the array, and the order is set to the index + 1
      // The config and content of the sections are empty by default
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

      // Global sections (Header & Footer)
      const globalSections = [
        { type: 'Header', title: 'Main Header', isGlobal: true },
        { type: 'Footer', title: 'Main Footer', isGlobal: true },
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

      // Page & Section Creation
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
    } catch (error) {
      console.error('Error during Google authentication:', error);
      throw new InternalServerErrorException(
        'Failed to authenticate via Google',
      );
    }
  }
}
