import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { GoogleLoginDto, UserDto } from './dto/auth.dto';
import { SESSION_COOKIE_NAME, SessionService } from './session.service';
import type { User } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly session: SessionService,
  ) {}

  @Post('google')
  @ApiOperation({
    operationId: 'loginWithGoogle',
    summary: 'Exchange a Google OAuth 2.0 authorization code for a session',
  })
  @ApiOkResponse({ type: UserDto })
  async loginWithGoogle(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserDto> {
    const user = await this.authService.loginWithGoogle(dto.code);
    response.cookie(
      SESSION_COOKIE_NAME,
      this.session.sign(user.id),
      this.session.cookieOptions(),
    );
    return toUserDto(user, await this.authService.isAdmin(user));
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'me', summary: 'Get the current session user' })
  @ApiOkResponse({ type: UserDto })
  async me(@CurrentUser() user: User): Promise<UserDto> {
    return toUserDto(user, await this.authService.isAdmin(user));
  }

  @Post('logout')
  @ApiOperation({ operationId: 'logout', summary: 'Clear the current session' })
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(SESSION_COOKIE_NAME, this.session.cookieOptions());
  }
}

function toUserDto(user: User, isAdmin: boolean): UserDto {
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    isAdmin,
    onboardingStatus: user.onboardingStatus,
  };
}
