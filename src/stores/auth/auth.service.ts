import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaDynamicService } from '../../prisma/prisma.service';
import { PrismaCentralService } from '../../prisma/prisma-central.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import * as bcrypt from 'bcrypt';
import { decrypt } from 'src/central/utils/crypto-utils';

@Injectable()
export class AuthService {
  constructor(
    private prismaCentral: PrismaCentralService,
    private prismaDynamic: PrismaDynamicService,
    private jwtService: JwtService,
  ) {}

  private async getDatabaseUrl(storeId: string): Promise<string> {
    const store = await this.prismaCentral.store.findUnique({
      where: { id: Number(storeId) },
    });

    if (!store) {
      throw new UnauthorizedException('Store not found');
    }

    const decryptedDbUrl = decrypt(store.dbUrl);

    return decryptedDbUrl;
  }

  // Login method
  async login(storeId: string, loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const dbUrl = await this.getDatabaseUrl(storeId);
    const client = this.prismaDynamic.getClient(dbUrl);

    const user = await client.user.findUnique({ where: { email }, select: { id: true, email: true, password: true, role: true }, });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, storeId };
    const accessToken = this.jwtService.sign(payload);

    // await client.log.create({
    //   data: { level: 'INFO', message: `User logged in: ${email}`, userId: user.id },
    // });

    return {
      success: true,
      message: 'Login successful',
      data: { accessToken, user },
    };
  }

  // Registration method
  async register(storeId: string, registerUserDto: RegisterUserDto) {
    const { email, password } = registerUserDto;

    const dbUrl = await this.getDatabaseUrl(storeId);
    const client = this.prismaDynamic.getClient(dbUrl);

    const existingUser = await client.user.findUnique({ where: { email }, select: { id: true, email: true, password: true, role: true }, });
    if (existingUser) {
      throw new ConflictException('Email already in use');
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
}
