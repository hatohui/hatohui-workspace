import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClientsService } from '@/modules/clients/services/clients.service';
import { ClientPrefillDto } from '@/modules/clients/dto/client.dto';
import { ClientDetailDto } from '@/modules/clients/dto/client-detail.dto';
import {
  CommissionIdentityDto,
  MatchCommissionIdentityDto,
  MyCommissionIdentityDto,
} from '@/modules/clients/dto/commission-identity.dto';
import { ClientIdentityService } from '@/modules/clients/services/client-identity.service';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly clientIdentity: ClientIdentityService,
  ) {}

  @Post('identity-match')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'matchCommissionIdentity',
    summary:
      'Profiles that look like the person ordering, by exact email, handle or name',
  })
  @ApiOkResponse({ type: CommissionIdentityDto, isArray: true })
  matchIdentity(
    @Body() dto: MatchCommissionIdentityDto,
  ): Promise<CommissionIdentityDto[]> {
    return this.clientIdentity.match(dto);
  }

  @Get('me/identity')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'myCommissionIdentity',
    summary:
      'Profile and contact points of the signed-in account, for ordering',
  })
  @ApiOkResponse({ type: MyCommissionIdentityDto })
  myIdentity(@CurrentUser() user: User): Promise<MyCommissionIdentityDto> {
    return this.clientIdentity.mine(user);
  }

  @Get('lookup')
  @ApiOperation({
    operationId: 'lookupClientByEmail',
    summary:
      "Prefill data for a returning client. 404 if this email hasn't commissioned before.",
  })
  @ApiQuery({ name: 'email', required: true, type: String })
  @ApiOkResponse({ type: ClientPrefillDto })
  async lookup(@Query('email') email: string): Promise<ClientPrefillDto> {
    const prefill = await this.clientsService.lookupByEmail(email);
    if (!prefill) {
      throw new NotFoundException(`No client found for ${email}`);
    }
    return prefill;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'client',
    summary:
      'A client of yours, with their linked account and their commissions with you',
  })
  @ApiOkResponse({ type: ClientDetailDto })
  detail(
    @Param('id') id: string,
    @CurrentUser() artist: User,
  ): Promise<ClientDetailDto> {
    return this.clientsService.detailForArtist(artist.id, id);
  }
}
