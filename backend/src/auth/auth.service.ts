import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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
}
