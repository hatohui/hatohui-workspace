import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import {
  TravelAllergiesDto,
  UpdateTravelAllergiesDto,
} from '@/modules/travel-allergies/dto/travel-allergies.dto';
import { TravelAllergiesService } from '@/modules/travel-allergies/services/travel-allergies.service';

@ApiTags('travel')
@Controller('travel/allergies')
@UseGuards(AuthGuard)
export class TravelAllergiesController {
  constructor(private readonly allergies: TravelAllergiesService) {}

  @Get()
  @ApiOperation({
    operationId: 'travelAllergies',
    summary: 'Allergens the signed-in user avoids',
  })
  @ApiOkResponse({ type: TravelAllergiesDto })
  get(@CurrentUser() user: User): Promise<TravelAllergiesDto> {
    return this.allergies.get(user.id);
  }

  @Put()
  @ApiOperation({ operationId: 'updateTravelAllergies' })
  @ApiOkResponse({ type: TravelAllergiesDto })
  update(
    @CurrentUser() user: User,
    @Body() dto: UpdateTravelAllergiesDto,
  ): Promise<TravelAllergiesDto> {
    return this.allergies.set(user.id, dto.allergens);
  }
}
