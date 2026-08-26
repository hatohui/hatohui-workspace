import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/services/auth.service';
import type { User } from '@prisma/client';
import { CommissionsService } from '@/modules/commissions/services/commissions.service';
import {
  CommissionEmailLookupQueryDto,
  CreateClientNoteDto,
} from '@/modules/commissions/dto/commission-lookup.dto';
import {
  CommissionQueryDto,
  PaginatedCommissionsDto,
} from '@/modules/commissions/dto/commission-query.dto';
import {
  AddReferenceAssetsDto,
  CommissionDto,
  CommissionPublicDto,
  CreatePrivateCommissionDto,
  DeliverCommissionDto,
  SubmitCommissionDto,
  UpdateCommissionQuoteDto,
  UpdateCommissionStatusDto,
  UpdateCommissionStepDto,
  UpdateCommissionVisibilityDto,
  UpdatePaymentStatusDto,
} from '@/modules/commissions/dto/commission.dto';
import {
  CommissionDetailDto,
  CommissionPublicDetailDto,
} from '@/modules/commissions/dto/commission-detail.dto';
import {
  CommentDto,
  CreateCommentDto,
} from '@/modules/commissions/dto/comment.dto';
import { CommissionQueueDto } from '@/modules/commissions/dto/commission-queue.dto';

@ApiTags('commissions')
@Controller('commissions')
export class CommissionsController {
  constructor(
    private readonly commissionsService: CommissionsService,
    private readonly auth: AuthService,
  ) {}

  @Post()
  @ApiOperation({
    operationId: 'submitCommission',
    summary: 'Submit a new commission request to an artist',
  })
  @ApiOkResponse({ type: CommissionDto })
  submit(@Body() dto: SubmitCommissionDto): Promise<CommissionDto> {
    return this.commissionsService.submit(dto);
  }

  @Post('private')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createPrivateCommission',
    summary:
      'Artist creates a commission directly, without going through an opening',
  })
  @ApiOkResponse({ type: CommissionDto })
  async createPrivate(
    @Body() dto: CreatePrivateCommissionDto,
    @CurrentUser() user: User,
  ): Promise<CommissionDto> {
    await this.assertArtist(user);
    return this.commissionsService.createPrivate(user.id, dto);
  }

  @Get('queue')
  @ApiOperation({
    operationId: 'commissionQueue',
    summary: "Public timeline of an artist's non-hidden, active commissions",
  })
  @ApiOkResponse({ type: CommissionQueueDto })
  queue(@Query('artistId') artistId: string): Promise<CommissionQueueDto> {
    return this.commissionsService.queue(artistId);
  }

  @Get('lookup')
  @ApiOperation({
    operationId: 'lookupCommissionsByEmail',
    summary: "List a client's own commissions by the email they submitted with",
  })
  @ApiOkResponse({ type: CommissionPublicDto, isArray: true })
  lookupByEmail(
    @Query() query: CommissionEmailLookupQueryDto,
  ): Promise<CommissionPublicDto[]> {
    return this.commissionsService.findByEmail(query.email);
  }

  @Get('lookup/code/:code')
  @ApiOperation({
    operationId: 'lookupCommissionByCode',
    summary: "Get a client's commission by their private access code",
  })
  @ApiOkResponse({ type: CommissionPublicDetailDto })
  lookupByCode(
    @Param('code') code: string,
  ): Promise<CommissionPublicDetailDto> {
    return this.commissionsService.findByAccessCode(code);
  }

  @Post('lookup/code/:code/reference-assets')
  @ApiOperation({
    operationId: 'addCommissionReferenceAssets',
    summary: 'Client adds reference images to their commission',
  })
  @ApiOkResponse({ type: CommissionPublicDto })
  addReferenceAssets(
    @Param('code') code: string,
    @Body() dto: AddReferenceAssetsDto,
  ): Promise<CommissionPublicDto> {
    return this.commissionsService.addClientReferenceAssets(code, dto);
  }

  @Post('lookup/code/:code/notes')
  @ApiOperation({
    operationId: 'addClientCommissionNote',
    summary: 'Client leaves a note (e.g. confirming a sketch)',
  })
  @ApiOkResponse({ type: CommentDto })
  addClientNote(
    @Param('code') code: string,
    @Body() dto: CreateClientNoteDto,
  ): Promise<CommentDto> {
    return this.commissionsService.addClientNote(code, dto.body);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commissions',
    summary: 'List your own commission requests',
  })
  @ApiOkResponse({ type: PaginatedCommissionsDto })
  list(
    @Query() query: CommissionQueryDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedCommissionsDto> {
    return this.commissionsService.list(
      user.id,
      query.query,
      query.status,
      query.sort ?? 'createdAt',
      query.direction ?? 'desc',
      query.page ?? 1,
      query.pageSize ?? 20,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commission',
    summary:
      'Get one of your own commissions with its notes and status history',
  })
  @ApiOkResponse({ type: CommissionDetailDto })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<CommissionDetailDto> {
    return this.commissionsService.findOne(user.id, id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionStatus',
    summary: "Change a commission's status",
  })
  @ApiOkResponse({ type: CommissionDto })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionStatusDto,
    @CurrentUser() user: User,
  ): Promise<CommissionDto> {
    return this.commissionsService.updateStatus(user.id, id, dto, user);
  }

  @Patch(':id/payment-status')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionPaymentStatus',
    summary: "Change a commission's payment status",
  })
  @ApiOkResponse({ type: CommissionDto })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
    @CurrentUser() user: User,
  ): Promise<CommissionDto> {
    return this.commissionsService.updatePaymentStatus(user.id, id, dto);
  }

  @Patch(':id/step')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionStep',
    summary: 'Toggle one of the internal production checklist steps',
  })
  @ApiOkResponse({ type: CommissionDto })
  updateStep(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionStepDto,
    @CurrentUser() user: User,
  ): Promise<CommissionDto> {
    return this.commissionsService.updateStep(user.id, id, dto);
  }

  @Patch(':id/quote')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionQuote',
    summary: "Update a commission's type, option, add-ons, and final quote",
  })
  @ApiOkResponse({ type: CommissionDto })
  updateQuote(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionQuoteDto,
    @CurrentUser() user: User,
  ): Promise<CommissionDto> {
    return this.commissionsService.updateQuote(user.id, id, dto);
  }

  @Patch(':id/visibility')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionVisibility',
    summary: 'Show or hide a commission from any public showcase',
  })
  @ApiOkResponse({ type: CommissionDto })
  updateVisibility(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionVisibilityDto,
    @CurrentUser() user: User,
  ): Promise<CommissionDto> {
    return this.commissionsService.updateVisibility(user.id, id, dto);
  }

  @Post(':id/deliver')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'deliverCommission',
    summary:
      'Attach the final artwork as a progress entry and email it to the client',
  })
  @ApiOkResponse({ type: CommissionDto })
  deliver(
    @Param('id') id: string,
    @Body() dto: DeliverCommissionDto,
    @CurrentUser() user: User,
  ): Promise<CommissionDto> {
    return this.commissionsService.deliver(user.id, id, dto);
  }

  @Post(':id/notes')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionNote',
    summary: 'Add an internal or client-facing note to a commission',
  })
  @ApiOkResponse({ type: CommentDto })
  addNote(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: User,
  ): Promise<CommentDto> {
    return this.commissionsService.addNote(user.id, id, dto);
  }

  private async assertArtist(user: User): Promise<void> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
  }
}
