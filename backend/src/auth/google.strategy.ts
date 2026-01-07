import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, StrategyOptions } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: `${configService.get<string>('BACKEND_URL') || 'http://localhost:4000'}/v1/auth/google/redirect`,
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails && emails[0] ? emails[0].value : '',
      firstName: name ? name.givenName : '',
      lastName: name ? name.familyName : '',
      picture: photos && photos[0] ? photos[0].value : '',
      accessToken,
      googleId: profile.id,
    };

    return this.authService.validateOAuthLogin(user);
  }
}
