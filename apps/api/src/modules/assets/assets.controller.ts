import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { AssetsService } from '@/modules/assets/services/assets.service';
import {
  AssetQueryDto,
  PaginatedAssetsDto,
} from '@/modules/assets/dto/asset-query.dto';
import {
  AssetDto,
  CreateAssetDto,
  UpdateAssetDto,
} from '@/modules/assets/dto/asset.dto';
import { TagSuggestionDto } from '@/modules/assets/dto/tag-suggestion.dto';

@ApiTags('assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ operationId: 'assets', summary: 'List gallery assets' })
  @ApiOkResponse({ type: PaginatedAssetsDto })
  list(@Query() query: AssetQueryDto): Promise<PaginatedAssetsDto> {
    return this.assetsService.list(
      query.query,
      query.tag,
      query.sort ?? 'newest',
      query.page ?? 1,
      query.pageSize ?? 24,
      query.uploadedById,
    );
  }

  @Get('tag-suggestions')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'assetTagSuggestions',
    summary: "Tags the caller has used plus their commission types' tags",
  })
  @ApiOkResponse({ type: [TagSuggestionDto] })
  tagSuggestions(@CurrentUser() user: User): Promise<TagSuggestionDto[]> {
    return this.assetsService.tagSuggestions(user.id);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'asset', summary: 'Get a gallery asset' })
  @ApiOkResponse({ type: AssetDto })
  get(@Param('id') id: string): Promise<AssetDto> {
    return this.assetsService.get(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createAsset',
    summary: 'Record an asset uploaded via POST /images/sign',
  })
  @ApiOkResponse({ type: AssetDto })
  create(
    @Body() dto: CreateAssetDto,
    @CurrentUser() uploader: User,
  ): Promise<AssetDto> {
    return this.assetsService.create(dto, uploader);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateAsset',
    summary: "Update an asset's tags",
  })
  @ApiOkResponse({ type: AssetDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() actor: User,
  ): Promise<AssetDto> {
    return this.assetsService.update(id, dto, actor);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteAsset', summary: 'Delete an asset' })
  remove(@Param('id') id: string, @CurrentUser() actor: User): Promise<void> {
    return this.assetsService.remove(id, actor);
  }
}
