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
  CommissionTypeDto,
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
      "List an artist's commission types (active only unless includeInactive=true)",
  })
  @ApiQuery({ name: 'artistId', required: true, type: String })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiOkResponse({ type: CommissionTypeDto, isArray: true })
  list(
    @Query('artistId') artistId: string,
    @Query('includeInactive') includeInactive?: string,
  ): Promise<CommissionTypeDto[]> {
    return this.commissionTypesService.list(
      artistId,
      includeInactive !== 'true',
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionType',
    summary: 'Create a commission type (also creates/reuses its linked Tag)',
  })
  @ApiOkResponse({ type: CommissionTypeDto })
  async create(
    @Body() dto: UpsertCommissionTypeDto,
    @CurrentUser() user: User,
  ): Promise<CommissionTypeDto> {
    await this.assertArtist(user);
    return this.commissionTypesService.create(user.id, dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionType',
    summary: 'Update one of your own commission types',
  })
  @ApiOkResponse({ type: CommissionTypeDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpsertCommissionTypeDto,
    @CurrentUser() user: User,
  ): Promise<CommissionTypeDto> {
    await this.assertArtist(user);
    return this.commissionTypesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCommissionType',
    summary: 'Delete one of your own commission types',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.assertArtist(user);
    return this.commissionTypesService.remove(user.id, id);
  }

  private async assertArtist(user: User): Promise<void> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
  }
}
