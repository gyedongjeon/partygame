import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    generateCode: jest.fn(),
    exchangeCode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockResponse = {
    redirect: jest.fn(),
    clearCookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('googleAuthRedirect', () => {
    it('should redirect to frontend with code', () => {
      const user = { id: 1 };
      const req = { user };
      const token = { access_token: 'jwt-token' };
      const code = 'one-time-code';
      const frontendUrl = 'http://localhost:3000';

      mockAuthService.login.mockReturnValue(token);
      mockAuthService.generateCode.mockReturnValue(code);
      mockConfigService.get.mockReturnValue(frontendUrl);

      controller.googleAuthRedirect(req, mockResponse);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `${frontendUrl}/api/auth/callback?code=${code}`,
      );
    });

    it('should prepend https:// if protocol is missing in FRONTEND_URL', () => {
      const user = { id: 1 };
      const req = { user };
      const token = { access_token: 'jwt-token' };
      const code = 'one-time-code';
      const frontendUrl = 'my-app.vercel.app'; // Missing protocol

      mockAuthService.login.mockReturnValue(token);
      mockAuthService.generateCode.mockReturnValue(code);
      mockConfigService.get.mockReturnValue(frontendUrl);

      controller.googleAuthRedirect(req, mockResponse);

      // This expectation defines the DESIRED behavior
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `https://${frontendUrl}/api/auth/callback?code=${code}`,
      );
    });
  });
});
