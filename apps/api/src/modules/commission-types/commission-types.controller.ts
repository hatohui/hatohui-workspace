import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CommissionTypesService } from '@/modules/commission-types/services/commission-types.service';
import {
  CommissionTypeDto,
  UpsertCommissionTypeDto,
} from '@/modules/commission-types/dto/commission-type.dto';

@ApiTags('commission-types')
@Controller('commission-types')
export class CommissionTypesController {
  constructor(
    private readonly commissionTypesService: CommissionTypesService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'commissionTypes',
    summary: 'List commission types (active only unless includeInactive=true)',
  })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiOkResponse({ type: CommissionTypeDto, isArray: true })
  list(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<CommissionTypeDto[]> {
    return this.commissionTypesService.list(includeInactive !== 'true');
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionType',
    summary: 'Create a commission type (also creates its linked Tag)',
  })
  @ApiOkResponse({ type: CommissionTypeDto })
  create(@Body() dto: UpsertCommissionTypeDto): Promise<CommissionTypeDto> {
    return this.commissionTypesService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionType',
    summary: 'Update a commission type',
  })
  @ApiOkResponse({ type: CommissionTypeDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpsertCommissionTypeDto,
  ): Promise<CommissionTypeDto> {
    return this.commissionTypesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCommissionType',
    summary: 'Delete a commission type',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.commissionTypesService.remove(id);
  }
}
