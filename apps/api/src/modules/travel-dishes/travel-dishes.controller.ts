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
import { TravelDishesService } from '@/modules/travel-dishes/services/travel-dishes.service';
import {
  CreateTravelDishDto,
  TravelDishDetailDto,
  TravelDishDto,
  TravelDishQueryDto,
  UpdateTravelDishDto,
} from '@/modules/travel-dishes/dto/travel-dish.dto';

@ApiTags('travel')
@Controller('travel/dishes')
export class TravelDishesController {
  constructor(private readonly dishes: TravelDishesService) {}

  @Get()
  @ApiOperation({ operationId: 'travelDishes', summary: 'Every dish' })
  @ApiOkResponse({ type: TravelDishDto, isArray: true })
  list(@Query() query: TravelDishQueryDto): Promise<TravelDishDto[]> {
    return this.dishes.list(query);
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

  @Post()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ operationId: 'createTravelDish' })
  @ApiOkResponse({ type: TravelDishDetailDto })
  create(
    @Body() dto: CreateTravelDishDto,
    @CurrentUser() user: User,
  ): Promise<TravelDishDetailDto> {
    return this.dishes.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ operationId: 'updateTravelDish' })
  @ApiOkResponse({ type: TravelDishDetailDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelDishDto,
  ): Promise<TravelDishDetailDto> {
    return this.dishes.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    operationId: 'deleteTravelDish',
    summary: 'Delete a dish and its recommendations',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.dishes.remove(id);
  }
}
