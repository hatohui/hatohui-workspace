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
import { TravelPlaceCategoriesService } from '@/modules/travel-place-categories/services/travel-place-categories.service';
import {
  TravelPlaceCategoryDto,
  UpdateTravelPlaceCategoryDto,
} from '@/modules/travel-place-categories/dto/travel-place-category.dto';
import {
  TravelBulkNamesDto,
  TravelBulkResultDto,
} from '@/modules/travel-recommendations/dto/travel-bulk.dto';

@ApiTags('travel')
@Controller('travel/place-categories')
export class TravelPlaceCategoriesController {
  constructor(private readonly categories: TravelPlaceCategoriesService) {}

  @Get()
  @ApiOperation({
    operationId: 'travelPlaceCategories',
    summary: 'Every place category, for suggestions and filters',
  })
  @ApiOkResponse({ type: TravelPlaceCategoryDto, isArray: true })
  list(): Promise<TravelPlaceCategoryDto[]> {
    return this.categories.list();
  }

  @Post('bulk')
  @HttpCode(200)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'bulkCreateTravelPlaceCategories',
    summary: 'Add several place categories by name',
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
  @ApiOperation({ operationId: 'updateTravelPlaceCategory' })
  @ApiOkResponse({ type: TravelPlaceCategoryDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelPlaceCategoryDto,
  ): Promise<TravelPlaceCategoryDto> {
    return this.categories.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'deleteTravelPlaceCategory',
    summary: 'Delete a place category; places keep their other categories',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.categories.remove(id);
  }
}
