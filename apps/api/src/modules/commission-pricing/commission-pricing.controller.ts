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
import { CommissionPricingService } from '@/modules/commission-pricing/services/commission-pricing.service';
import {
  CommissionAddonPricingDto,
  CommissionOptionPricingDto,
  CommissionPricingDto,
  CommissionRushFeeSettingDto,
  CommissionSettingsDto,
  UpsertCommissionAddonPricingDto,
  UpsertCommissionOptionPricingDto,
  UpsertCommissionRushFeeSettingDto,
  UpsertCommissionSettingsDto,
} from '@/modules/commission-pricing/dto/commission-pricing.dto';

@ApiTags('commission-pricing')
@Controller('commission-pricing')
export class CommissionPricingController {
  constructor(
    private readonly pricingService: CommissionPricingService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'commissionPricing',
    summary:
      "An artist's active options/addons/rush-fee/currency, for the commission request form",
  })
  @ApiQuery({ name: 'artistId', required: true, type: String })
  @ApiOkResponse({ type: CommissionPricingDto })
  getActive(
    @Query('artistId') artistId: string,
  ): Promise<CommissionPricingDto> {
    return this.pricingService.getActive(artistId);
  }

  @Put('rush-fee')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionRushFee',
    summary: 'Update your own rush-fee surcharge setting',
  })
  @ApiOkResponse({ type: CommissionRushFeeSettingDto })
  async updateRushFee(
    @Body() dto: UpsertCommissionRushFeeSettingDto,
    @CurrentUser() user: User,
  ): Promise<CommissionRushFeeSettingDto> {
    await this.assertArtist(user);
    return this.pricingService.updateRushFee(user.id, dto);
  }

  @Get('settings')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commissionSettings',
    summary:
      'Your own commission settings — currency, auto-accept, notification email, accepted payment methods',
  })
  @ApiOkResponse({ type: CommissionSettingsDto })
  getSettings(@CurrentUser() user: User): Promise<CommissionSettingsDto> {
    return this.pricingService.getSettings(user.id);
  }

  @Put('settings')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionSettings',
    summary: 'Update your own commission settings',
  })
  @ApiOkResponse({ type: CommissionSettingsDto })
  async updateSettings(
    @Body() dto: UpsertCommissionSettingsDto,
    @CurrentUser() user: User,
  ): Promise<CommissionSettingsDto> {
    await this.assertArtist(user);
    return this.pricingService.updateSettings(user.id, dto);
  }

  @Get('options')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commissionOptionPricings',
    summary:
      'List your own commission option pricing rows, optionally scoped to one commission type',
  })
  @ApiQuery({ name: 'commissionTypeId', required: false, type: String })
  @ApiOkResponse({ type: CommissionOptionPricingDto, isArray: true })
  listOptions(
    @CurrentUser() user: User,
    @Query('commissionTypeId') commissionTypeId?: string,
  ): Promise<CommissionOptionPricingDto[]> {
    return this.pricingService.listOptions(user.id, commissionTypeId);
  }

  @Post('options')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionOptionPricing',
    summary: 'Create a commission option pricing row',
  })
  @ApiOkResponse({ type: CommissionOptionPricingDto })
  async createOption(
    @Body() dto: UpsertCommissionOptionPricingDto,
    @CurrentUser() user: User,
  ): Promise<CommissionOptionPricingDto> {
    await this.assertArtist(user);
    return this.pricingService.createOption(user.id, dto);
  }

  @Put('options/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionOptionPricing',
    summary: 'Update one of your own commission option pricing rows',
  })
  @ApiOkResponse({ type: CommissionOptionPricingDto })
  updateOption(
    @Param('id') id: string,
    @Body() dto: UpsertCommissionOptionPricingDto,
    @CurrentUser() user: User,
  ): Promise<CommissionOptionPricingDto> {
    return this.pricingService.updateOption(user.id, id, dto);
  }

  @Delete('options/:id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCommissionOptionPricing',
    summary: 'Delete one of your own commission option pricing rows',
  })
  deleteOption(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.pricingService.deleteOption(user.id, id);
  }

  @Get('addons')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commissionAddonPricings',
    summary: 'List your own commission add-on pricing rows',
  })
  @ApiOkResponse({ type: CommissionAddonPricingDto, isArray: true })
  listAddons(@CurrentUser() user: User): Promise<CommissionAddonPricingDto[]> {
    return this.pricingService.listAddons(user.id);
  }

  @Post('addons')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionAddonPricing',
    summary: 'Create a commission add-on pricing row',
  })
  @ApiOkResponse({ type: CommissionAddonPricingDto })
  async createAddon(
    @Body() dto: UpsertCommissionAddonPricingDto,
    @CurrentUser() user: User,
  ): Promise<CommissionAddonPricingDto> {
    await this.assertArtist(user);
    return this.pricingService.createAddon(user.id, dto);
  }

  @Put('addons/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionAddonPricing',
    summary: 'Update one of your own commission add-on pricing rows',
  })
  @ApiOkResponse({ type: CommissionAddonPricingDto })
  updateAddon(
    @Param('id') id: string,
    @Body() dto: UpsertCommissionAddonPricingDto,
    @CurrentUser() user: User,
  ): Promise<CommissionAddonPricingDto> {
    return this.pricingService.updateAddon(user.id, id, dto);
  }

  @Delete('addons/:id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCommissionAddonPricing',
    summary: 'Delete one of your own commission add-on pricing rows',
  })
  deleteAddon(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.pricingService.deleteAddon(user.id, id);
  }

  private async assertArtist(user: User): Promise<void> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
  }
}
