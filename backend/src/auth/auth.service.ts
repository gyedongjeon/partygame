import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  // One-time code store: code -> { jwt, expiresAt }
  private codeStore: Map<string, { jwt: string; expiresAt: number }> = new Map();
  private readonly CODE_EXPIRY_MS = 60 * 1000; // 1 minute

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    // Cleanup expired codes every minute
    setInterval(() => this.cleanupExpiredCodes(), 60 * 1000);
  }

  private cleanupExpiredCodes() {
    const now = Date.now();
    for (const [code, data] of this.codeStore.entries()) {
      if (data.expiresAt < now) {
        this.codeStore.delete(code);
      }
    }
  }

  async validateOAuthLogin(profile: Partial<User>): Promise<User> {
    try {
      if (!profile.email) {
        throw new Error('Email not provided from Google');
      }
      const user = await this.usersService.findByEmail(profile.email);
      if (user) {
        return user;
      }
      // Create new user
      return this.usersService.create(profile);
    } catch (error) {
      throw new InternalServerErrorException(
        'validateOAuthLogin',
        (error as Error).message,
      );
    }
  }

  login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Generate a one-time code that can be exchanged for the JWT.
   * The code expires in 1 minute and can only be used once.
   */
  generateCode(jwt: string): string {
    const code = uuidv4();
    this.codeStore.set(code, {
      jwt,
      expiresAt: Date.now() + this.CODE_EXPIRY_MS,
    });
    return code;
  }

  /**
   * Exchange a one-time code for the JWT.
   * Throws UnauthorizedException if code is invalid or expired.
   */
  exchangeCode(code: string): string {
    const data = this.codeStore.get(code);
    if (!data) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    if (data.expiresAt < Date.now()) {
      this.codeStore.delete(code);
      throw new UnauthorizedException('Code expired');
    }
    // One-time use: delete immediately
    this.codeStore.delete(code);
    return data.jwt;
  }
}
