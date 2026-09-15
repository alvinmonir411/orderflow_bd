import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('এই ইমেইল দিয়ে ইতোমধ্যে একটি একাউন্ট খোলা হয়েছে');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Create unique slug for store
    const slug = dto.storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    // Create Store and Owner User in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: dto.storeName,
          slug: slug,
          phone: dto.phone,
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          name: dto.name,
          role: 'MERCHANT_OWNER',
          storeId: store.id,
        },
      });

      return { user, store };
    });

    const token = this.generateToken(result.user.id, result.user.email, result.user.role, result.store.id);

    return {
      message: 'রেজিস্ট্রেশন সফল হয়েছে',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        storeId: result.store.id,
        storeName: result.store.name,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { store: true },
    });

    if (!user) {
      throw new UnauthorizedException('ভুল ইমেইল অথবা পাসওয়ার্ড প্রদান করেছেন');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('ভুল ইমেইল অথবা পাসওয়ার্ড প্রদান করেছেন');
    }

    const token = this.generateToken(user.id, user.email, user.role, user.storeId);

    return {
      message: 'লগইন সফল হয়েছে',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.storeId,
        storeName: user.store.name,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    });

    if (!user) {
      throw new UnauthorizedException('ইউজার পাওয়া যায়নি');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: user.storeId,
      store: user.store,
    };
  }

  private generateToken(userId: string, email: string, role: string, storeId: string) {
    return this.jwtService.sign({
      userId,
      email,
      role,
      storeId,
    });
  }
}
