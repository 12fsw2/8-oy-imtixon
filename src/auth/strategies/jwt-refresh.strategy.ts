import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string }) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();

    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, expiresAt: { gt: new Date() } },
    });
    if (!stored) throw new UnauthorizedException('Refresh token expired or not found');

    const valid = await bcrypt.compare(token, stored.token);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null, isActive: true },
    });
    if (!user) throw new UnauthorizedException();

    return { ...user, refreshTokenId: stored.id };
  }
}
