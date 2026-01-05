import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: 'http://localhost:4000/api/auth/google/redirect',
            scope: ['email', 'profile'],
        } as any);
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        try {
            const { name, emails, photos } = profile;
            const user = await this.authService.validateOAuthLogin({
                email: emails[0].value,
                displayName: name.givenName + ' ' + name.familyName,
                googleId: profile.id,
                avatarUrl: photos[0].value,
            });
            done(null, user);
        } catch (err) {
            done(err, false);
        }
    }
}
