import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { AuthenticatedUser } from '../auth/authenticated-user.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user profile' })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: { user: AuthenticatedUser }) {
    return req.user;
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated' })
  @ApiBody({
    schema: { type: 'object', properties: { displayName: { type: 'string' } } },
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @Req() req: { user: AuthenticatedUser },
    @Body() body: { displayName: string },
  ) {
    return this.usersService.update(req.user.id, {
      displayName: body.displayName,
    });
  }
}
