import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OptionalAuthGuard } from '@/modules/auth/guards/optional-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { OptionalCurrentUser } from '@/modules/auth/decorators/optional-current-user.decorator';
import { AssetProcessService } from '@/modules/asset-process/services/asset-process.service';
import {
  AssetProcessStepDto,
  ReplaceAssetProcessDto,
} from '@/modules/asset-process/dto/asset-process.dto';

@ApiTags('assets')
@Controller('assets/:id/process')
export class AssetProcessController {
  constructor(private readonly assetProcess: AssetProcessService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'assetProcess',
    summary: "An artwork's sketch-to-final process images, in order",
  })
  @ApiOkResponse({ type: AssetProcessStepDto, isArray: true })
  list(
    @Param('id') id: string,
    @OptionalCurrentUser() viewer: User | null,
  ): Promise<AssetProcessStepDto[]> {
    return this.assetProcess.list(id, viewer);
  }

  @Put()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'replaceAssetProcess',
    summary: "Replace an artwork's process images with this ordered list",
  })
  @ApiOkResponse({ type: AssetProcessStepDto, isArray: true })
  replace(
    @Param('id') id: string,
    @Body() dto: ReplaceAssetProcessDto,
    @CurrentUser() actor: User,
  ): Promise<AssetProcessStepDto[]> {
    return this.assetProcess.replace(id, dto, actor);
  }
}
