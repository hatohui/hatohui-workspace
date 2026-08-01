import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { CurrentUser } from '@/modules/auth/current-user.decorator';
import type { User } from '@prisma/client';
import { CommissionsService } from './commissions.service';
import {
  CommissionEmailLookupQueryDto,
  CreateClientNoteDto,
} from './dto/commission-lookup.dto';
import {
  CommissionQueryDto,
  PaginatedCommissionsDto,
} from './dto/commission-query.dto';
import {
  AddReferenceAssetsDto,
  AssignCommissionDto,
  CommissionDto,
  CommissionPublicDto,
  DeliverCommissionDto,
  SubmitCommissionDto,
  UpdateCommissionQuoteDto,
  UpdateCommissionStatusDto,
  UpdateCommissionStepDto,
  UpdateCommissionVisibilityDto,
  UpdateCommissionProjectDto,
  UpdatePaymentStatusDto,
} from './dto/commission.dto';
import {
  CommissionDetailDto,
  CommissionPublicDetailDto,
} from './dto/commission-detail.dto';
import {
  CommissionNoteDto,
  CreateCommissionNoteDto,
} from './dto/commission-note.dto';
import { CommissionQueueDto } from './dto/commission-queue.dto';

@ApiTags('commissions')
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post()
  @ApiOperation({
    operationId: 'submitCommission',
    summary: 'Submit a new commission request',
  })
  @ApiOkResponse({ type: CommissionDto })
  submit(@Body() dto: SubmitCommissionDto): Promise<CommissionDto> {
    return this.commissionsService.submit(dto);
  }

  @Get('queue')
  @ApiOperation({
    operationId: 'commissionQueue',
    summary: 'Public timeline of non-hidden, active commissions',
  })
  @ApiOkResponse({ type: CommissionQueueDto })
  queue(): Promise<CommissionQueueDto> {
    return this.commissionsService.queue();
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
  @ApiOkResponse({ type: CommissionNoteDto })
  addClientNote(
    @Param('code') code: string,
    @Body() dto: CreateClientNoteDto,
  ): Promise<CommissionNoteDto> {
    return this.commissionsService.addClientNote(code, dto.body);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commissions',
    summary: 'List commission requests',
  })
  @ApiOkResponse({ type: PaginatedCommissionsDto })
  list(@Query() query: CommissionQueryDto): Promise<PaginatedCommissionsDto> {
    return this.commissionsService.list(
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
    summary: 'Get a commission request with its notes and status history',
  })
  @ApiOkResponse({ type: CommissionDetailDto })
  findOne(@Param('id') id: string): Promise<CommissionDetailDto> {
    return this.commissionsService.findOne(id);
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
    @CurrentUser() viewer: User,
  ): Promise<CommissionDto> {
    return this.commissionsService.updateStatus(id, dto, viewer);
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
  ): Promise<CommissionDto> {
    return this.commissionsService.updatePaymentStatus(id, dto);
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
  ): Promise<CommissionDto> {
    return this.commissionsService.updateStep(id, dto);
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
  ): Promise<CommissionDto> {
    return this.commissionsService.updateQuote(id, dto);
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
  ): Promise<CommissionDto> {
    return this.commissionsService.updateVisibility(id, dto);
  }

  @Post(':id/deliver')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'deliverCommission',
    summary: 'Attach the final artwork and email it to the client',
  })
  @ApiOkResponse({ type: CommissionDto })
  deliver(
    @Param('id') id: string,
    @Body() dto: DeliverCommissionDto,
  ): Promise<CommissionDto> {
    return this.commissionsService.deliver(id, dto);
  }

  @Patch(':id/assign')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'assignCommission',
    summary: 'Assign or unassign a team member to a commission',
  })
  @ApiOkResponse({ type: CommissionDto })
  assign(
    @Param('id') id: string,
    @Body() dto: AssignCommissionDto,
  ): Promise<CommissionDto> {
    return this.commissionsService.assign(id, dto);
  }

  @Patch(':id/project')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionProject',
    summary: 'Attach or detach a commission from a project',
  })
  @ApiOkResponse({ type: CommissionDto })
  updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionProjectDto,
  ): Promise<CommissionDto> {
    return this.commissionsService.updateProject(id, dto);
  }

  @Post(':id/notes')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionNote',
    summary: 'Add an internal or client-facing note to a commission',
  })
  @ApiOkResponse({ type: CommissionNoteDto })
  addNote(
    @Param('id') id: string,
    @Body() dto: CreateCommissionNoteDto,
    @CurrentUser() author: User,
  ): Promise<CommissionNoteDto> {
    return this.commissionsService.addNote(id, dto, author);
  }
}
