import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { TravelEditorGuard } from '@/modules/travel-access/guards/travel-editor.guard';
import { TravelSpotCategoriesService } from '@/modules/travel-spot-categories/services/travel-spot-categories.service';
import {
  TravelSpotCategoryDto,
  UpdateTravelSpotCategoryDto,
} from '@/modules/travel-spot-categories/dto/travel-spot-category.dto';
import {
  TravelBulkNamesDto,
  TravelBulkResultDto,
} from '@/modules/travel-recommendations/dto/travel-bulk.dto';

@ApiTags('travel')
@Controller('travel/spot-categories')
export class TravelSpotCategoriesController {
  constructor(private readonly categories: TravelSpotCategoriesService) {}

  @Get()
  @ApiOperation({
    operationId: 'travelSpotCategories',
    summary: 'Every spot category, for suggestions and filters',
  })
  @ApiOkResponse({ type: TravelSpotCategoryDto, isArray: true })
  list(): Promise<TravelSpotCategoryDto[]> {
    return this.categories.list();
  }

  @Post('bulk')
  @HttpCode(200)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'bulkCreateTravelSpotCategories',
    summary: 'Add several spot categories by name',
  })
  @ApiOkResponse({ type: TravelBulkResultDto })
  bulkCreate(
    @Body() dto: TravelBulkNamesDto,
    @CurrentUser() user: User,
  ): Promise<TravelBulkResultDto> {
    return this.categories.bulkCreate(dto.names, user.id);
  }

  @Patch(':id')
  @UseGuards(TravelEditorGuard)
  @ApiOperation({ operationId: 'updateTravelSpotCategory' })
  @ApiOkResponse({ type: TravelSpotCategoryDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelSpotCategoryDto,
  ): Promise<TravelSpotCategoryDto> {
    return this.categories.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'deleteTravelSpotCategory',
    summary: 'Delete a spot category; spots keep their other categories',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.categories.remove(id);
  }
}
