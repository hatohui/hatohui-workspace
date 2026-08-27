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
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/services/auth.service';
import type { User } from '@prisma/client';
import { CommissionGroupsService } from '@/modules/commission-groups/services/commission-groups.service';
import {
  AddCommissionGroupMemberDto,
  CommissionGroupDto,
  CommissionGroupViewDto,
  CreateCommissionGroupDto,
  PostCommissionGroupCommentDto,
  UpdateCommissionGroupDto,
} from '@/modules/commission-groups/dto/commission-group.dto';
import { CommentDto } from '@/modules/commissions/dto/comment.dto';

@ApiTags('commission-groups')
@Controller('commission-groups')
export class CommissionGroupsController {
  constructor(
    private readonly groupsService: CommissionGroupsService,
    private readonly auth: AuthService,
  ) {}

  @Get('mine')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'myCommissionGroups',
    summary: 'List your own commission groups',
  })
  @ApiOkResponse({ type: CommissionGroupDto, isArray: true })
  async listMine(@CurrentUser() user: User): Promise<CommissionGroupDto[]> {
    await this.assertArtist(user);
    return this.groupsService.listMine(user.id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'createCommissionGroup',
    summary: 'Create a commission group',
  })
  @ApiOkResponse({ type: CommissionGroupDto })
  async create(
    @Body() dto: CreateCommissionGroupDto,
    @CurrentUser() user: User,
  ): Promise<CommissionGroupDto> {
    await this.assertArtist(user);
    return this.groupsService.create(user.id, dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateCommissionGroup',
    summary: 'Update one of your own commission groups',
  })
  @ApiOkResponse({ type: CommissionGroupDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionGroupDto,
    @CurrentUser() user: User,
  ): Promise<CommissionGroupDto> {
    await this.assertArtist(user);
    return this.groupsService.update(user.id, id, dto);
  }

  @Post(':id/members')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'addCommissionGroupMember',
    summary: 'Add a member to one of your own commission groups',
  })
  @ApiOkResponse({ type: CommissionGroupDto })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddCommissionGroupMemberDto,
    @CurrentUser() user: User,
  ): Promise<CommissionGroupDto> {
    await this.assertArtist(user);
    return this.groupsService.addMember(user.id, id, dto);
  }

  @Delete(':id/members/:clientId')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({
    operationId: 'removeCommissionGroupMember',
    summary: 'Remove a member from one of your own commission groups',
  })
  async removeMember(
    @Param('id') id: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.assertArtist(user);
    return this.groupsService.removeMember(user.id, id, clientId);
  }

  @Get('by-code/:code')
  @ApiOperation({
    operationId: 'commissionGroupByCode',
    summary: "A group's shared member view, by the group's access code",
  })
  @ApiOkResponse({ type: CommissionGroupViewDto })
  getByCode(@Param('code') code: string): Promise<CommissionGroupViewDto> {
    return this.groupsService.getByAccessCode(code);
  }

  @Post('by-code/:code/comments')
  @ApiOperation({
    operationId: 'postCommissionGroupComment',
    summary:
      "Post to a group's shared thread, proving membership via your own commission's access code",
  })
  @ApiOkResponse({ type: CommentDto })
  postComment(
    @Param('code') code: string,
    @Body() dto: PostCommissionGroupCommentDto,
  ): Promise<CommentDto> {
    return this.groupsService.postComment(code, dto);
  }

  private async assertArtist(user: User): Promise<void> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
  }
}
