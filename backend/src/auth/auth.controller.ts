import { Controller, Get, Post, Req, Res, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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
    description: 'Redirects to frontend with one-time code',
  })
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const user = req.user;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { access_token } = this.authService.login(user);

    // Generate one-time code instead of passing JWT directly
    const code = this.authService.generateCode(access_token);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    let redirectBase = frontendUrl || 'http://localhost:3000';
    if (!redirectBase.startsWith('http')) {
      redirectBase = `https://${redirectBase}`;
    }
    // Redirect with one-time code (NOT the JWT)
    const redirectUrl = `${redirectBase}/api/auth/callback?code=${code}`;

    res.redirect(redirectUrl);
  }

  @ApiOperation({ summary: 'Exchange one-time code for JWT' })
  @ApiBody({ schema: { properties: { code: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid or expired code' })
  @Post('exchange')
  exchangeCode(@Body() body: { code: string }) {
    const jwt = this.authService.exchangeCode(body.code);
    return { access_token: jwt };
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logs out user and clears cookie' })
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(@Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const isHttps = frontendUrl?.startsWith('https') ?? false;
    const isProduction = nodeEnv === 'production';

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction || isHttps,
      sameSite: isProduction ? 'none' : 'lax',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}
