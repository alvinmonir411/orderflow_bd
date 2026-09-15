import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'orderflow_bd_super_secret_jwt_key_2026_bd',
    });
  }

  async validate(payload: { userId: string; email: string; role: string; storeId: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: { store: true },
    });

    if (!user) {
      throw new UnauthorizedException('অ্যাকাউন্টে অ্যাক্সেস করার অনুমতি নেই');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      storeId: user.storeId,
      storeName: user.store.name,
    };
  }
}
