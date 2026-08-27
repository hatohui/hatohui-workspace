import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/services/auth.service';
import type { User } from '@prisma/client';
import { CommissionTypesService } from '@/modules/commission-types/services/commission-types.service';
import {
  ArtistCommissionTypeDto,
  CommissionTypeDto,
  UpsertArtistCommissionTypeDto,
  UpsertCommissionTypeDto,
} from '@/modules/commission-types/dto/commission-type.dto';

@ApiTags('commission-types')
@Controller('commission-types')
export class CommissionTypesController {
  constructor(
    private readonly commissionTypesService: CommissionTypesService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'commissionTypes',
    summary:
      'List the platform commission-type catalog (active only unless includeInactive=true)',
  })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiOkResponse({ type: CommissionTypeDto, isArray: true })
  listCatalog(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<CommissionTypeDto[]> {
    return this.commissionTypesService.listCatalog(includeInactive !== 'true');
  }

  @Get('by-artist/:artistId')
  @ApiOperation({
    operationId: 'commissionTypesByArtist',
    summary:
      "List one artist's enabled commission types (public storefront view)",
  })
  @ApiOkResponse({ type: CommissionTypeDto, isArray: true })
  listByArtist(
    @Param('artistId') artistId: string,
  ): Promise<CommissionTypeDto[]> {
    return this.commissionTypesService.listEnabledForArtist(artistId);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'myCommissionTypes',
    summary: 'List the catalog joined with your own enablement of each entry',
  })
  @ApiOkResponse({ type: ArtistCommissionTypeDto, isArray: true })
  async listMine(
    @CurrentUser() user: User,
  ): Promise<ArtistCommissionTypeDto[]> {
    await this.assertArtist(user);
    return this.commissionTypesService.listForArtist(user.id);
  }

  @Put(':id/enable')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'setArtistCommissionTypeEnabled',
    summary: 'Enable/disable a catalog type for yourself, and set its order',
  })
  @ApiOkResponse({ type: ArtistCommissionTypeDto })
  async setEnabled(
    @Param('id') id: string,
    @Body() dto: UpsertArtistCommissionTypeDto,
    @CurrentUser() user: User,
  ): Promise<ArtistCommissionTypeDto> {
    await this.assertArtist(user);
    return this.commissionTypesService.setEnabled(user.id, id, dto);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionType',
    summary:
      'Add a commission type to the platform catalog (also creates/reuses its linked Tag)',
  })
  @ApiOkResponse({ type: CommissionTypeDto })
  async create(
    @Body() dto: UpsertCommissionTypeDto,
    @CurrentUser() user: User,
  ): Promise<CommissionTypeDto> {
    await this.assertAdmin(user);
    return this.commissionTypesService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionType',
    summary: 'Update a catalog commission type',
  })
  @ApiOkResponse({ type: CommissionTypeDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpsertCommissionTypeDto,
    @CurrentUser() user: User,
  ): Promise<CommissionTypeDto> {
    await this.assertAdmin(user);
    return this.commissionTypesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCommissionType',
    summary: 'Remove a commission type from the platform catalog',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.assertAdmin(user);
    return this.commissionTypesService.remove(id);
  }

  private async assertArtist(user: User): Promise<void> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
  }

  private async assertAdmin(user: User): Promise<void> {
    if (!(await this.auth.isAdmin(user))) {
      throw new ForbiddenException('Admin access denied');
    }
  }
}
