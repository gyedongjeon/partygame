import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) { }

  @ApiOperation({ summary: 'Initiate Google OAuth2 flow' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Initiates the Google OAuth2 flow
  }

  @ApiOperation({ summary: 'Google OAuth2 callback' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with HttpOnly cookie',
  })
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const user = req.user;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { access_token } = this.authService.login(user);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const redirectBase = frontendUrl || 'http://localhost:3000';
    // Redirect to Frontend API Route for "Token Handover" (First-Party Cookie setting)
    const redirectUrl = `${redirectBase}/api/auth/callback?token=${access_token}`;

    // We strictly use redirect now, no server-side Set-Cookie header on this response
    // to avoid Third-Party Cookie blocking issues on Firefox/Safari/Mobile.
    res.redirect(redirectUrl);
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logs out user and clears cookie' })
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(@Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const isProduction =
      process.env.NODE_ENV === 'production' ||
      (Boolean(frontendUrl) && (frontendUrl as string).startsWith('https'));

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}
