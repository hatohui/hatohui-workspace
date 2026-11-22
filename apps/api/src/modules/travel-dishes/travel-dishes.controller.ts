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
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { TravelEditorGuard } from '@/modules/travel-access/guards/travel-editor.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  TravelBulkNamesDto,
  TravelBulkResultDto,
} from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { TravelDishDescriptionsService } from '@/modules/travel-dishes/services/travel-dish-descriptions.service';
import { TravelDishesService } from '@/modules/travel-dishes/services/travel-dishes.service';
import {
  CreateTravelDishDto,
  GenerateTravelDishDescriptionsDto,
  GenerateTravelDishDescriptionsResultDto,
  PaginatedTravelDishesDto,
  TravelDishDescriptionBatchProgressDto,
  TravelDishDescriptionJobsDto,
  TravelDishDetailDto,
  TravelDishDto,
  TravelDishPageQueryDto,
  TravelDishQueryDto,
  UpdateTravelDishDto,
} from '@/modules/travel-dishes/dto/travel-dish.dto';

@ApiTags('travel')
@Controller('travel/dishes')
export class TravelDishesController {
  constructor(
    private readonly dishes: TravelDishesService,
    private readonly descriptions: TravelDishDescriptionsService,
  ) {}

  @Get()
  @ApiOperation({ operationId: 'travelDishes', summary: 'Every dish' })
  @ApiOkResponse({ type: TravelDishDto, isArray: true })
  list(@Query() query: TravelDishQueryDto): Promise<TravelDishDto[]> {
    return this.dishes.list(query);
  }

  @Get('page')
  @ApiOperation({
    operationId: 'travelDishesPage',
    summary: 'Paginated dishes',
  })
  @ApiOkResponse({ type: PaginatedTravelDishesDto })
  listPage(
    @Query() query: TravelDishPageQueryDto,
  ): Promise<PaginatedTravelDishesDto> {
    return this.dishes.listPage(query);
  }

  @Get('description-jobs')
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'travelDishDescriptionJobs',
    summary: 'Current AI dish description batch progress and last batch errors',
  })
  @ApiOkResponse({ type: TravelDishDescriptionJobsDto })
  descriptionJobs(): Promise<TravelDishDescriptionJobsDto> {
    return this.descriptions.jobs();
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'travelDish',
    summary: 'A dish and every place recommended for it',
  })
  @ApiOkResponse({ type: TravelDishDetailDto })
  get(@Param('id') id: string): Promise<TravelDishDetailDto> {
    return this.dishes.get(id);
  }

  @Post('bulk')
  @HttpCode(200)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'bulkCreateTravelDishes',
    summary: 'Add several dishes by name',
  })
  @ApiOkResponse({ type: TravelBulkResultDto })
  bulkCreate(
    @Body() dto: TravelBulkNamesDto,
    @CurrentUser() user: User,
  ): Promise<TravelBulkResultDto> {
    return this.dishes.bulkCreate(dto.names, user.id);
  }

  @Post('description-jobs')
  @HttpCode(200)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'startTravelDishDescriptionBatch',
    summary:
      'Start a background AI batch (in groups of 10) for dishes missing descriptions',
  })
  @ApiOkResponse({ type: TravelDishDescriptionBatchProgressDto })
  startDescriptionBatch(
    @Body() dto: GenerateTravelDishDescriptionsDto,
  ): Promise<TravelDishDescriptionBatchProgressDto> {
    return this.descriptions.startBatch(dto.dishIds);
  }

  @Post('generate-descriptions')
  @HttpCode(200)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'generateTravelDishDescriptions',
    summary: 'Generate concise English descriptions for dishes missing one',
  })
  @ApiOkResponse({ type: GenerateTravelDishDescriptionsResultDto })
  generateDescriptions(
    @Body() dto: GenerateTravelDishDescriptionsDto,
  ): Promise<GenerateTravelDishDescriptionsResultDto> {
    return this.descriptions.generateMissing(dto.dishIds);
  }

  @Post()
  @UseGuards(TravelEditorGuard)
  @ApiOperation({ operationId: 'createTravelDish' })
  @ApiOkResponse({ type: TravelDishDetailDto })
  create(
    @Body() dto: CreateTravelDishDto,
    @CurrentUser() user: User,
  ): Promise<TravelDishDetailDto> {
    return this.dishes.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(TravelEditorGuard)
  @ApiOperation({ operationId: 'updateTravelDish' })
  @ApiOkResponse({ type: TravelDishDetailDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelDishDto,
    @CurrentUser() user: User,
  ): Promise<TravelDishDetailDto> {
    return this.dishes.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'deleteTravelDish',
    summary: 'Delete a dish and its recommendations',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.dishes.remove(id);
  }
}
