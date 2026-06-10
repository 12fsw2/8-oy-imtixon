import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (exists) throw new ConflictException('Phone number already registered');

    const hashed = await bcrypt.hash(dto.password, 10);

    const company = await this.prisma.company.create({
      data: {
        name: dto.companyName,
        address: dto.companyAddress,
        users: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            password: hashed,
            role: 'OWNER',
          },
        },
      },
      include: { users: { select: { id: true, companyId: true, firstName: true, lastName: true, phone: true, role: true } } },
    });

    const user = company.users[0];
    const tokens = await this.issueTokens(user.id, user.companyId, user.role);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user || user.deletedAt || !user.isActive)
      throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.companyId, user.role);
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        companyId: user.companyId,
      },
      ...tokens,
    };
  }

  async refresh(userId: string, refreshTokenId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    await this.prisma.refreshToken.deleteMany({ where: { id: refreshTokenId } });
    return this.issueTokens(user.id, user.companyId, user.role);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        companyId: true,
        company: { select: { id: true, name: true, phone: true, address: true } },
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async issueTokens(userId: string, companyId: string, role: string) {
    const payload = { sub: userId, companyId, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    const hashed = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, token: hashed, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
