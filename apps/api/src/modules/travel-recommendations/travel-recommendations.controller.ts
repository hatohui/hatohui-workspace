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
import { AdminRoleGuard } from '@/modules/auth/guards/admin-role.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { TravelRecommendationsService } from '@/modules/travel-recommendations/services/travel-recommendations.service';
import { TravelRecommendationDto } from '@/modules/travel-recommendations/dto/travel-recommendation.dto';
import { TravelRecommendationQueryDto } from '@/modules/travel-recommendations/dto/travel-recommendation-query.dto';
import {
  CreateTravelRecommendationDto,
  UpdateTravelRecommendationDto,
} from '@/modules/travel-recommendations/dto/travel-recommendation-input.dto';

@ApiTags('travel')
@Controller('travel/recommendations')
export class TravelRecommendationsController {
  constructor(private readonly recommendations: TravelRecommendationsService) {}

  @Get()
  @ApiOperation({
    operationId: 'travelRecommendations',
    summary: 'The food catalog: each dish a place is recommended for',
  })
  @ApiOkResponse({ type: TravelRecommendationDto, isArray: true })
  list(
    @Query() query: TravelRecommendationQueryDto,
  ): Promise<TravelRecommendationDto[]> {
    return this.recommendations.list(query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'travelRecommendation' })
  @ApiOkResponse({ type: TravelRecommendationDto })
  get(@Param('id') id: string): Promise<TravelRecommendationDto> {
    return this.recommendations.get(id);
  }

  @Post()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    operationId: 'createTravelRecommendation',
    summary: 'Recommend a dish at a place, creating either one by name',
  })
  @ApiOkResponse({ type: TravelRecommendationDto })
  create(
    @Body() dto: CreateTravelRecommendationDto,
    @CurrentUser() user: User,
  ): Promise<TravelRecommendationDto> {
    return this.recommendations.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ operationId: 'updateTravelRecommendation' })
  @ApiOkResponse({ type: TravelRecommendationDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelRecommendationDto,
    @CurrentUser() user: User,
  ): Promise<TravelRecommendationDto> {
    return this.recommendations.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ operationId: 'deleteTravelRecommendation' })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.recommendations.remove(id);
  }
}
