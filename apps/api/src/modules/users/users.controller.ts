import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { UserDto } from '@/modules/auth/dto/auth.dto';
import { AuthService } from '@/modules/auth/services/auth.service';
import { UsersService } from '@/modules/users/services/users.service';
import {
  PaginatedUsersDto,
  UpdateMeDto,
  UserSearchQueryDto,
} from '@/modules/users/dto/user.dto';
import type { User } from '@prisma/client';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auth: AuthService,
  ) {}

  @Get('search')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'searchUsers',
    summary: 'Find accounts to connect with, by name or @handle',
  })
  @ApiOkResponse({ type: PaginatedUsersDto })
  search(
    @Query() query: UserSearchQueryDto,
    @CurrentUser() viewer: User,
  ): Promise<PaginatedUsersDto> {
    return this.usersService.search(
      query.query,
      query.page ?? 1,
      query.pageSize ?? 10,
      viewer,
    );
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateMe',
    summary: "Update the current user's account fields (e.g. handle)",
  })
  @ApiOkResponse({ type: UserDto })
  async updateMe(
    @Body() dto: UpdateMeDto,
    @CurrentUser() viewer: User,
  ): Promise<UserDto> {
    const updated = await this.usersService.updateMe(dto, viewer);
    return this.auth.toUserDto(updated);
  }
}
