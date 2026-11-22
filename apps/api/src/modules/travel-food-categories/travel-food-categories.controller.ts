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
import { TravelFoodCategoriesService } from '@/modules/travel-food-categories/services/travel-food-categories.service';
import {
  TravelFoodCategoryDto,
  UpdateTravelFoodCategoryDto,
} from '@/modules/travel-food-categories/dto/travel-food-category.dto';
import {
  TravelBulkNamesDto,
  TravelBulkResultDto,
} from '@/modules/travel-recommendations/dto/travel-bulk.dto';

@ApiTags('travel')
@Controller('travel/food-categories')
export class TravelFoodCategoriesController {
  constructor(private readonly categories: TravelFoodCategoriesService) {}

  @Get()
  @ApiOperation({
    operationId: 'travelFoodCategories',
    summary: 'Every food category, for suggestions and filters',
  })
  @ApiOkResponse({ type: TravelFoodCategoryDto, isArray: true })
  list(): Promise<TravelFoodCategoryDto[]> {
    return this.categories.list();
  }

  @Post('bulk')
  @HttpCode(200)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'bulkCreateTravelFoodCategories',
    summary: 'Add several food categories by name',
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
  @ApiOperation({ operationId: 'updateTravelFoodCategory' })
  @ApiOkResponse({ type: TravelFoodCategoryDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelFoodCategoryDto,
  ): Promise<TravelFoodCategoryDto> {
    return this.categories.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'deleteTravelFoodCategory',
    summary: 'Delete a food category; dishes keep their other categories',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.categories.remove(id);
  }
}
