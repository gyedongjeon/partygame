import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateOAuthLogin(details: { email: string; displayName: string; googleId: string; avatarUrl: string }) {
        try {
            const user = await this.usersService.findByEmail(details.email);
            if (user) {
                // Update user info if needed? For now just return
                return user;
            }
            // Create new user
            return this.usersService.create(details);
        } catch (error) {
            throw new InternalServerErrorException('validateOAuthLogin', error.message);
        }
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
