import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
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
import { CommissionOpeningsService } from '@/modules/commission-openings/services/commission-openings.service';
import {
  CommissionOpeningDto,
  UpsertCommissionOpeningDto,
} from '@/modules/commission-openings/dto/commission-opening.dto';

@ApiTags('commission-openings')
@Controller('commission-openings')
export class CommissionOpeningsController {
  constructor(
    private readonly openingsService: CommissionOpeningsService,
    private readonly auth: AuthService,
  ) {}

  @Get('current')
  @ApiOperation({
    operationId: 'currentCommissionOpening',
    summary:
      'The opening a storefront should show for an artist — open, else next scheduled, else most recently closed. 404 only if the artist has never opened.',
  })
  @ApiQuery({ name: 'artistId', required: true, type: String })
  @ApiOkResponse({ type: CommissionOpeningDto })
  async getCurrent(
    @Query('artistId') artistId: string,
  ): Promise<CommissionOpeningDto> {
    const opening = await this.openingsService.getCurrent(artistId);
    if (!opening) {
      throw new NotFoundException(
        `No open or scheduled commission opening for artist ${artistId}`,
      );
    }
    return opening;
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'myCommissionOpenings',
    summary: 'List your own commission openings, past and present',
  })
  @ApiOkResponse({ type: CommissionOpeningDto, isArray: true })
  async listMine(@CurrentUser() user: User): Promise<CommissionOpeningDto[]> {
    await this.assertArtist(user);
    return this.openingsService.listMine(user.id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionOpening',
    summary: 'Open (or schedule) a commission window',
  })
  @ApiOkResponse({ type: CommissionOpeningDto })
  async create(
    @Body() dto: UpsertCommissionOpeningDto,
    @CurrentUser() user: User,
  ): Promise<CommissionOpeningDto> {
    await this.assertArtist(user);
    return this.openingsService.create(user.id, dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionOpening',
    summary: 'Update the configuration of one of your own commission openings',
  })
  @ApiOkResponse({ type: CommissionOpeningDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpsertCommissionOpeningDto,
    @CurrentUser() user: User,
  ): Promise<CommissionOpeningDto> {
    await this.assertArtist(user);
    return this.openingsService.update(user.id, id, dto);
  }

  @Post(':id/open')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'openCommissionOpening',
    summary: 'Manually open a scheduled commission opening now',
  })
  @ApiOkResponse({ type: CommissionOpeningDto })
  async open(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<CommissionOpeningDto> {
    await this.assertArtist(user);
    return this.openingsService.open(user.id, id);
  }

  @Post(':id/close')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'closeCommissionOpening',
    summary: 'Manually close an open commission opening',
  })
  @ApiOkResponse({ type: CommissionOpeningDto })
  async close(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<CommissionOpeningDto> {
    await this.assertArtist(user);
    return this.openingsService.close(user.id, id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCommissionOpening',
    summary: 'Delete a commission opening that has no commissions attached',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.assertArtist(user);
    return this.openingsService.remove(user.id, id);
  }

  private async assertArtist(user: User): Promise<void> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
  }
}
