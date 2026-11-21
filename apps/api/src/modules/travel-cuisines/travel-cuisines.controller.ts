import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TravelCuisinesService } from '@/modules/travel-cuisines/services/travel-cuisines.service';
import { TravelCuisineDto } from '@/modules/travel-cuisines/dto/travel-cuisine.dto';

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
}
