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
import { AuthGuard } from '@/modules/auth/auth.guard';
import { CurrentUser } from '@/modules/auth/current-user.decorator';
import type { User } from '@prisma/client';
import { AssetsService } from './assets.service';
import { AssetQueryDto, PaginatedAssetsDto } from './dto/asset-query.dto';
import { AssetDto, CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';

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
    );
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
  ): Promise<AssetDto> {
    return this.assetsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteAsset', summary: 'Delete an asset' })
  remove(@Param('id') id: string): Promise<void> {
    return this.assetsService.remove(id);
  }
}
