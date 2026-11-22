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
import { TravelCuisinesService } from '@/modules/travel-cuisines/services/travel-cuisines.service';
import {
  TravelCuisineDto,
  UpdateTravelCuisineDto,
} from '@/modules/travel-cuisines/dto/travel-cuisine.dto';
import {
  TravelBulkNamesDto,
  TravelBulkResultDto,
} from '@/modules/travel-recommendations/dto/travel-bulk.dto';

@ApiTags('travel')
@Controller('travel/cuisines')
export class TravelCuisinesController {
  constructor(private readonly cuisines: TravelCuisinesService) {}

  @Get()
  @ApiOperation({
    operationId: 'travelCuisines',
    summary: 'Every cuisine tag, for suggestions and filters',
  })
  @ApiOkResponse({ type: TravelCuisineDto, isArray: true })
  list(): Promise<TravelCuisineDto[]> {
    return this.cuisines.list();
  }

  @Post('bulk')
  @HttpCode(200)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'bulkCreateTravelCuisines',
    summary: 'Add several cuisines by name',
  })
  @ApiOkResponse({ type: TravelBulkResultDto })
  bulkCreate(
    @Body() dto: TravelBulkNamesDto,
    @CurrentUser() user: User,
  ): Promise<TravelBulkResultDto> {
    return this.cuisines.bulkCreate(dto.names, user.id);
  }

  @Patch(':id')
  @UseGuards(TravelEditorGuard)
  @ApiOperation({ operationId: 'updateTravelCuisine' })
  @ApiOkResponse({ type: TravelCuisineDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelCuisineDto,
  ): Promise<TravelCuisineDto> {
    return this.cuisines.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'deleteTravelCuisine',
    summary: 'Delete a cuisine tag; dishes keep their other cuisines',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.cuisines.remove(id);
  }
}
