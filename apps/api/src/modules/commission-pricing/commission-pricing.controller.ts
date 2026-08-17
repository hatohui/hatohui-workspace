import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CommissionPricingService } from '@/modules/commission-pricing/services/commission-pricing.service';
import {
  CommissionAddonPricingDto,
  CommissionOptionPricingDto,
  CommissionPricingDto,
  CommissionRushFeeSettingDto,
  CommissionTypePricingDto,
  UpsertCommissionAddonPricingDto,
  UpsertCommissionOptionPricingDto,
  UpsertCommissionRushFeeSettingDto,
  UpsertCommissionTypePricingDto,
} from '@/modules/commission-pricing/dto/commission-pricing.dto';

@ApiTags('commission-pricing')
@Controller('commission-pricing')
export class CommissionPricingController {
  constructor(private readonly pricingService: CommissionPricingService) {}

  @Get()
  @ApiOperation({
    operationId: 'commissionPricing',
    summary: 'Active pricing config used by the commission request form',
  })
  @ApiOkResponse({ type: CommissionPricingDto })
  getActive(): Promise<CommissionPricingDto> {
    return this.pricingService.getActive();
  }

  @Put('rush-fee')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionRushFee',
    summary: 'Update the rush-fee surcharge settings',
  })
  @ApiOkResponse({ type: CommissionRushFeeSettingDto })
  updateRushFee(
    @Body() dto: UpsertCommissionRushFeeSettingDto,
  ): Promise<CommissionRushFeeSettingDto> {
    return this.pricingService.updateRushFee(dto);
  }

  @Get('types')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commissionTypePricings',
    summary: 'List commission type pricing rows',
  })
  @ApiOkResponse({ type: CommissionTypePricingDto, isArray: true })
  listTypes(): Promise<CommissionTypePricingDto[]> {
    return this.pricingService.listTypes();
  }

  @Post('types')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionTypePricing',
    summary: 'Create a commission type pricing row',
  })
  @ApiOkResponse({ type: CommissionTypePricingDto })
  createType(
    @Body() dto: UpsertCommissionTypePricingDto,
  ): Promise<CommissionTypePricingDto> {
    return this.pricingService.createType(dto);
  }

  @Put('types/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionTypePricing',
    summary: 'Update a commission type pricing row',
  })
  @ApiOkResponse({ type: CommissionTypePricingDto })
  updateType(
    @Param('id') id: string,
    @Body() dto: UpsertCommissionTypePricingDto,
  ): Promise<CommissionTypePricingDto> {
    return this.pricingService.updateType(id, dto);
  }

  @Delete('types/:id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCommissionTypePricing',
    summary: 'Delete a commission type pricing row',
  })
  deleteType(@Param('id') id: string): Promise<void> {
    return this.pricingService.deleteType(id);
  }

  @Get('options')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commissionOptionPricings',
    summary: 'List commission option pricing rows',
  })
  @ApiOkResponse({ type: CommissionOptionPricingDto, isArray: true })
  listOptions(): Promise<CommissionOptionPricingDto[]> {
    return this.pricingService.listOptions();
  }

  @Post('options')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionOptionPricing',
    summary: 'Create a commission option pricing row',
  })
  @ApiOkResponse({ type: CommissionOptionPricingDto })
  createOption(
    @Body() dto: UpsertCommissionOptionPricingDto,
  ): Promise<CommissionOptionPricingDto> {
    return this.pricingService.createOption(dto);
  }

  @Put('options/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionOptionPricing',
    summary: 'Update a commission option pricing row',
  })
  @ApiOkResponse({ type: CommissionOptionPricingDto })
  updateOption(
    @Param('id') id: string,
    @Body() dto: UpsertCommissionOptionPricingDto,
  ): Promise<CommissionOptionPricingDto> {
    return this.pricingService.updateOption(id, dto);
  }

  @Delete('options/:id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCommissionOptionPricing',
    summary: 'Delete a commission option pricing row',
  })
  deleteOption(@Param('id') id: string): Promise<void> {
    return this.pricingService.deleteOption(id);
  }

  @Get('addons')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commissionAddonPricings',
    summary: 'List commission add-on pricing rows',
  })
  @ApiOkResponse({ type: CommissionAddonPricingDto, isArray: true })
  listAddons(): Promise<CommissionAddonPricingDto[]> {
    return this.pricingService.listAddons();
  }

  @Post('addons')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionAddonPricing',
    summary: 'Create a commission add-on pricing row',
  })
  @ApiOkResponse({ type: CommissionAddonPricingDto })
  createAddon(
    @Body() dto: UpsertCommissionAddonPricingDto,
  ): Promise<CommissionAddonPricingDto> {
    return this.pricingService.createAddon(dto);
  }

  @Put('addons/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionAddonPricing',
    summary: 'Update a commission add-on pricing row',
  })
  @ApiOkResponse({ type: CommissionAddonPricingDto })
  updateAddon(
    @Param('id') id: string,
    @Body() dto: UpsertCommissionAddonPricingDto,
  ): Promise<CommissionAddonPricingDto> {
    return this.pricingService.updateAddon(id, dto);
  }

  @Delete('addons/:id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCommissionAddonPricing',
    summary: 'Delete a commission add-on pricing row',
  })
  deleteAddon(@Param('id') id: string): Promise<void> {
    return this.pricingService.deleteAddon(id);
  }
}
