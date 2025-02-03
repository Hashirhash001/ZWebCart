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
  
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      throw new BadRequestException('Invalid email format');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
  
    const uniqueIdentifier = Date.now();
    const dbName = `${sanitizedName}_db_${uniqueIdentifier}`;
    const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5432/${dbName}`;
    const encryptedDbUrl = encrypt(dbUrl);
    const decryptedDbUrl = decrypt(encryptedDbUrl);
  
    let dbClient;
    let storeTransaction;
  
    try {
      dbClient = new Client({
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
        throw new ConflictException(`Database ${dbName} already exists!`);
      }
  
      console.log(`Creating database: ${dbName}...`);
      await dbClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created.`);
  
      // Begin a Prisma transaction to register the user and store
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
      execSync(migrateCommand, { stdio: 'inherit' });
      console.log('Migrations applied successfully.');
  
      const storePrisma = new PrismaClient({
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

      // Create a JWT token
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
  
      if (dbClient && dbName) {
        console.log(`Rolling back: Dropping database ${dbName}...`);
        await dbClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
        console.log('Database rollback complete.');
      }
  
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
