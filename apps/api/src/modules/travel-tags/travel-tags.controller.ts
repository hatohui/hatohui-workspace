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
import { TravelEditorGuard } from '@/modules/travel-access/guards/travel-editor.guard';
import { TravelTagsService } from '@/modules/travel-tags/services/travel-tags.service';
import {
  BulkCreateTravelTagsDto,
  TravelTagDto,
  UpdateTravelTagDto,
} from '@/modules/travel-tags/dto/travel-tag.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';

@ApiTags('travel')
@Controller('travel/tags')
export class TravelTagsController {
  constructor(private readonly tags: TravelTagsService) {}

  @Get()
  @ApiOperation({
    operationId: 'travelTags',
    summary: 'Diet and allergen tags, in display order',
  })
  @ApiOkResponse({ type: TravelTagDto, isArray: true })
  list(): Promise<TravelTagDto[]> {
    return this.tags.list();
  }

  @Post('bulk')
  @HttpCode(200)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'bulkCreateTravelTags',
    summary: 'Add several diet or allergen tags by name',
  })
  @ApiOkResponse({ type: TravelBulkResultDto })
  bulkCreate(
    @Body() dto: BulkCreateTravelTagsDto,
  ): Promise<TravelBulkResultDto> {
    return this.tags.bulkCreate(dto.kind, dto.names);
  }

  @Patch(':id')
  @UseGuards(TravelEditorGuard)
  @ApiOperation({ operationId: 'updateTravelTag' })
  @ApiOkResponse({ type: TravelTagDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelTagDto,
  ): Promise<TravelTagDto> {
    return this.tags.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'deleteTravelTag',
    summary: 'Delete a tag; recommendations lose it',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.tags.remove(id);
  }
}
