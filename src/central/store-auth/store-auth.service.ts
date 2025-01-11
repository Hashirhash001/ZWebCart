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
import { LogLevel } from '@prisma/client';
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
    level: LogLevel,
    message: string,
    userId?: string,
    context?: any,
  ) {
    await this.prisma.log.create({
      data: {
        level,
        message,
        userId,
        context,
      },
    });
  }

  // Register a new store with its owner
  async registerStore(registerStoreDto: RegisterStoreDto) {
    const { email, password, name, currency, timezone, logoUrl } =
      registerStoreDto;

    // Input sanitization
    const sanitizedEmail = validator.normalizeEmail(email.trim());
    const sanitizedPassword = password.trim();
    const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '_');

    // Validate sanitized inputs
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      throw new BadRequestException('Invalid email format');
    }

    const dbClient = new Client({
      user: process.env.DB_USER,
      host: 'localhost',
      password: process.env.DB_PASSWORD,
      port: 5433,
    });

    const uniqueIdentifier = Date.now(); // Using timestamp to ensure uniqueness
    const dbName = `${sanitizedName}_db_${uniqueIdentifier}`;
    const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5433/${dbName}`;

    // Encrypt the dbUrl before saving to the database
    const encryptedDbUrl = encrypt(dbUrl);
    const decryptedDbUrl = decrypt(encryptedDbUrl);

    let user;

    // Start a Prisma transaction
    const transaction = await this.prisma.$transaction(async (prisma) => {
      // Step 1: Check if the email already exists in the system
      const existingUser = await prisma.user.findUnique({
        where: { email: sanitizedEmail },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use', 'Email conflict');
      }

      // Step 2: Hash the password
      const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);

      // Step 3: Create a new PostgreSQL database programmatically within the transaction
      try {
        await dbClient.connect();
        await dbClient.query(`CREATE DATABASE "${dbName}"`);
        console.log(`Database ${dbName} created successfully.`);
      } catch (error) {
        console.error(`Error creating database ${dbName}:`, error);
        await this.logMessage(
          LogLevel.ERROR,
          `Failed to create store database: ${error.message}`,
          undefined,
          { dbUrl },
        );
        throw new ConflictException(
          'Failed to create store database',
          'Database creation failed',
        );
      }

      // Step 4: Run migrations for the new database
      try {
        console.log('Running migrations...');
        execSync(
          `npx cross-env DATABASE_URL=${decryptedDbUrl} npx prisma migrate deploy --schema=prisma/schema.prisma`,
        );
        console.log('Migrations applied successfully.');
      } catch (error) {
        console.error('Error applying migrations:', error);
        await this.logMessage(
          LogLevel.ERROR,
          `Migration application failed: ${error.message}`,
          undefined,
          { dbUrl },
        );
        throw new InternalServerErrorException(
          'Failed to apply schema migrations',
          'Migration application failed',
        );
      }

      // Step 5: Register the user and store in the central database
      user = await prisma.user.create({
        data: {
          email: sanitizedEmail,
          password: hashedPassword,
          role: 'USER',
          stores: {
            create: {
              name: sanitizedName,
              dbName,
              dbUrl: encryptedDbUrl, // Save encrypted DB URL
            },
          },
        },
        include: { stores: true },
      });

      // Step 6: Save store settings in the new store database
      const storeId = user.stores[0].id; // Assuming the store is the first and only store
      const storePrisma = new PrismaClient({
        datasources: { db: { url: decryptedDbUrl } },
      });

      try {
        await storePrisma.storeSettings.create({
          data: {
            storeId,
            storeName: user.stores[0].name,
            currency: currency || 'USD', // Default to 'USD' if not provided
            timezone: timezone || 'UTC', // Default to 'UTC' if not provided
            logoUrl: logoUrl || '', // Default to an empty string if not provided
          },
        });
      } catch (error) {
        console.error('Error saving store settings:', error);
        await this.logMessage(
          LogLevel.ERROR,
          `Failed to save store settings: ${error.message}`,
          undefined,
          { storeId },
        );
        // Manually drop the database since PostgreSQL can't roll back the database creation automatically
        try {
          await dbClient.query(`DROP DATABASE "${dbName}"`);
          console.log(`Dropped the database ${dbName} due to error.`);
        } catch (dropError) {
          console.error('Error dropping database:', dropError);
        }
        throw new InternalServerErrorException(
          'Failed to save store settings',
          'Store settings creation failed',
        );
      } finally {
        await storePrisma.$disconnect();
      }

      return user; // Return user for the response after successful transaction
    });

    // Log the successful registration
    await this.logMessage(
      LogLevel.INFO,
      `Store and user registered successfully`,
      transaction.id,
      { storeName: transaction.stores[0].name },
    );

    // Create the JWT payload and access token
    const payload = {
      sub: transaction.id,
      email: transaction.email,
      role: transaction.role,
      store: transaction.stores[0], // Assuming only one store per user
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Store and user registered successfully',
      data: {
        accessToken,
        user: {
          id: transaction.id,
          email: transaction.email,
          role: transaction.role,
          store: transaction.stores[0], // Only include the first store details
        },
      },
    };
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
      throw new UnauthorizedException(
        'Invalid email or password',
        'Authentication failed',
      );
    }

    // Create a JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      stores: user.stores.map((store) => ({ id: store.id, name: store.name })),
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
