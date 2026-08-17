import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { ConnectionsService } from '@/modules/connections/services/connections.service';
import {
  ConnectionDto,
  ConnectionRequestsDto,
  ConnectionsDto,
  CreateConnectionRequestDto,
} from '@/modules/connections/dto/connection.dto';
import type { User } from '@prisma/client';

@ApiTags('connections')
@Controller('connections')
@UseGuards(AuthGuard)
export class ConnectionsController {
  constructor(private readonly connections: ConnectionsService) {}

  @Get()
  @ApiOperation({
    operationId: 'connections',
    summary: 'Accounts the current account is connected with',
  })
  @ApiOkResponse({ type: ConnectionsDto })
  list(@CurrentUser() viewer: User): Promise<ConnectionsDto> {
    return this.connections.list(viewer);
  }

  @Get('requests')
  @ApiOperation({
    operationId: 'connectionRequests',
    summary: 'Pending connection requests, incoming and outgoing',
  })
  @ApiOkResponse({ type: ConnectionRequestsDto })
  listRequests(@CurrentUser() viewer: User): Promise<ConnectionRequestsDto> {
    return this.connections.listRequests(viewer);
  }

  @Post('requests')
  @ApiOperation({
    operationId: 'requestConnection',
    summary:
      'Ask an account to connect (auto-accepts if they already asked you)',
  })
  @ApiOkResponse({ type: ConnectionDto })
  request(
    @Body() dto: CreateConnectionRequestDto,
    @CurrentUser() viewer: User,
  ): Promise<ConnectionDto> {
    return this.connections.request(dto.userId, viewer);
  }

  @Post('requests/:id/accept')
  @ApiOperation({
    operationId: 'acceptConnectionRequest',
    summary: 'Accept an incoming connection request',
  })
  @ApiOkResponse({ type: ConnectionDto })
  accept(
    @Param('id') id: string,
    @CurrentUser() viewer: User,
  ): Promise<ConnectionDto> {
    return this.connections.accept(id, viewer);
  }

  @Delete('requests/:id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'withdrawConnectionRequest',
    summary: 'Decline an incoming request, or withdraw one you sent',
  })
  withdraw(
    @Param('id') id: string,
    @CurrentUser() viewer: User,
  ): Promise<void> {
    return this.connections.withdraw(id, viewer);
  }

  @Delete(':userId')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'disconnect',
    summary: 'Remove an existing connection with an account',
  })
  disconnect(
    @Param('userId') userId: string,
    @CurrentUser() viewer: User,
  ): Promise<void> {
    return this.connections.disconnect(userId, viewer);
  }
}
