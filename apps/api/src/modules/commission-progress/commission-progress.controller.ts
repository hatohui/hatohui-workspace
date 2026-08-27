import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/services/auth.service';
import type { User } from '@prisma/client';
import { CommissionProgressService } from '@/modules/commission-progress/services/commission-progress.service';
import {
  CommissionProgressDto,
  CreateCommissionProgressDto,
  FinalizeCommissionProgressDto,
  UpdateCommissionProgressDto,
} from '@/modules/commission-progress/dto/commission-progress.dto';

@ApiTags('commission-progress')
@Controller('commission-progress')
export class CommissionProgressController {
  constructor(
    private readonly progressService: CommissionProgressService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commissionProgress',
    summary: 'The full progress timeline for one of your own commissions',
  })
  @ApiQuery({ name: 'commissionId', required: true, type: String })
  @ApiOkResponse({ type: CommissionProgressDto, isArray: true })
  async list(
    @Query('commissionId') commissionId: string,
    @CurrentUser() user: User,
  ): Promise<CommissionProgressDto[]> {
    await this.assertArtist(user);
    return this.progressService.listForArtist(user.id, commissionId);
  }

  @Get('by-code/:code')
  @ApiOperation({
    operationId: 'commissionProgressByCode',
    summary: "A commission's client-visible progress timeline, by access code",
  })
  @ApiOkResponse({ type: CommissionProgressDto, isArray: true })
  listByCode(@Param('code') code: string): Promise<CommissionProgressDto[]> {
    return this.progressService.listByAccessCode(code);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionProgress',
    summary: 'Post a new progress entry to one of your own commissions',
  })
  @ApiOkResponse({ type: CommissionProgressDto })
  async create(
    @Body() dto: CreateCommissionProgressDto,
    @CurrentUser() user: User,
  ): Promise<CommissionProgressDto> {
    await this.assertArtist(user);
    return this.progressService.create(user.id, dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionProgress',
    summary: 'Update one of your own progress entries',
  })
  @ApiOkResponse({ type: CommissionProgressDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionProgressDto,
    @CurrentUser() user: User,
  ): Promise<CommissionProgressDto> {
    await this.assertArtist(user);
    return this.progressService.update(user.id, id, dto);
  }

  @Post(':id/finalize')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'finalizeCommissionProgress',
    summary:
      'Mark a progress entry final — the delivered artwork, optionally attached to a Project',
  })
  @ApiOkResponse({ type: CommissionProgressDto })
  async finalize(
    @Param('id') id: string,
    @Body() dto: FinalizeCommissionProgressDto,
    @CurrentUser() user: User,
  ): Promise<CommissionProgressDto> {
    await this.assertArtist(user);
    return this.progressService.finalize(user.id, id, dto.projectId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCommissionProgress',
    summary: 'Remove one of your own progress entries',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.assertArtist(user);
    return this.progressService.remove(user.id, id);
  }

  private async assertArtist(user: User): Promise<void> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
  }
}
