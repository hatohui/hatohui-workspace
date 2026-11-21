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
import { TravelCountriesService } from '@/modules/travel-countries/services/travel-countries.service';
import {
  TravelCountryDto,
  UpdateTravelCountryDto,
} from '@/modules/travel-countries/dto/travel-country.dto';
import {
  TravelBulkNamesDto,
  TravelBulkResultDto,
} from '@/modules/travel-recommendations/dto/travel-bulk.dto';

@ApiTags('travel')
@Controller('travel/countries')
export class TravelCountriesController {
  constructor(private readonly countries: TravelCountriesService) {}

  @Get()
  @ApiOperation({
    operationId: 'travelCountries',
    summary: 'Every country with its areas, for the location picker',
  })
  @ApiOkResponse({ type: TravelCountryDto, isArray: true })
  list(): Promise<TravelCountryDto[]> {
    return this.countries.list();
  }

  @Post('bulk')
  @HttpCode(200)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'bulkCreateTravelCountries',
    summary: 'Add several countries by name',
  })
  @ApiOkResponse({ type: TravelBulkResultDto })
  bulkCreate(
    @Body() dto: TravelBulkNamesDto,
    @CurrentUser() user: User,
  ): Promise<TravelBulkResultDto> {
    return this.countries.bulkCreate(dto.names, user.id);
  }

  @Patch(':id')
  @UseGuards(TravelEditorGuard)
  @ApiOperation({ operationId: 'updateTravelCountry' })
  @ApiOkResponse({ type: TravelCountryDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelCountryDto,
  ): Promise<TravelCountryDto> {
    return this.countries.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'deleteTravelCountry',
    summary: 'Delete a country and its areas; places keep existing, unassigned',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.countries.remove(id);
  }
}
