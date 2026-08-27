import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import { AuthorRole, Visibility, type CommissionGroup } from '@prisma/client';
import {
  toCommentDto,
  CommentDto,
} from '@/modules/commissions/dto/comment.dto';
import {
  AddCommissionGroupMemberDto,
  CommissionGroupCommissionDto,
  CommissionGroupDto,
  CommissionGroupViewDto,
  CreateCommissionGroupDto,
  PostCommissionGroupCommentDto,
  UpdateCommissionGroupDto,
} from '@/modules/commission-groups/dto/commission-group.dto';

const groupInclude = {
  members: { include: { client: true } },
} as const;

type GroupWithMembers = CommissionGroup & {
  members: { client: { id: string; name: string; email: string } }[];
};

@Injectable()
export class CommissionGroupsService {
  constructor(private readonly db: Database) {}

  async listMine(artistId: string): Promise<CommissionGroupDto[]> {
    const rows = await this.db.commissionGroup.findMany({
      where: { artistId },
      include: groupInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toGroupDto);
  }

  async create(
    artistId: string,
    dto: CreateCommissionGroupDto,
  ): Promise<CommissionGroupDto> {
    const row = await this.db.commissionGroup.create({
      data: {
        artistId,
        title: dto.title,
        description: dto.description ?? null,
        projectId: dto.projectId ?? null,
      },
      include: groupInclude,
    });
    return toGroupDto(row);
  }

  async update(
    artistId: string,
    id: string,
    dto: UpdateCommissionGroupDto,
  ): Promise<CommissionGroupDto> {
    await this.assertOwned(artistId, id);
    const row = await this.db.commissionGroup.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        description: dto.description ?? undefined,
        quote: dto.quote ?? undefined,
        currency: dto.currency ?? undefined,
      },
      include: groupInclude,
    });
    return toGroupDto(row);
  }

  async addMember(
    artistId: string,
    id: string,
    dto: AddCommissionGroupMemberDto,
  ): Promise<CommissionGroupDto> {
    await this.assertOwned(artistId, id);
    const existing = await this.db.client.findUnique({
      where: { email: dto.email },
    });
    if (!existing && !dto.name) {
      throw new BadRequestException(
        'name is required when this email has no existing Client',
      );
    }
    const client =
      existing ??
      (await this.db.client.create({
        data: { email: dto.email, name: dto.name! },
      }));

    await this.db.commissionGroupMember.upsert({
      where: { groupId_clientId: { groupId: id, clientId: client.id } },
      update: {},
      create: { groupId: id, clientId: client.id },
    });

    const row = await this.db.commissionGroup.findUniqueOrThrow({
      where: { id },
      include: groupInclude,
    });
    return toGroupDto(row);
  }

  async removeMember(
    artistId: string,
    id: string,
    clientId: string,
  ): Promise<void> {
    await this.assertOwned(artistId, id);
    await this.db.commissionGroupMember.deleteMany({
      where: { groupId: id, clientId },
    });
  }

  /** The shared member view: full visibility into every commission in the
   * group, gated by the group's own access code — same anonymous-access
   * model as Commission.accessCode. */
  async getByAccessCode(code: string): Promise<CommissionGroupViewDto> {
    const group = await this.db.commissionGroup.findUnique({
      where: { accessCode: code },
      include: groupInclude,
    });
    if (!group) {
      throw new NotFoundException(`Commission group ${code} not found`);
    }
    const [commissions, comments] = await Promise.all([
      this.db.commission.findMany({
        where: { groupId: group.id },
        include: { client: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.db.comment.findMany({
        where: { groupId: group.id },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    return {
      ...toGroupDto(group),
      commissions: commissions.map(toGroupCommissionDto),
      comments: comments.map(toCommentDto),
    };
  }

  /** Posting requires the member's own commission access code, which proves
   * they're actually in this group rather than someone the group code
   * merely leaked to — the check the PRD flags the schema can't express. */
  async postComment(
    code: string,
    dto: PostCommissionGroupCommentDto,
  ): Promise<CommentDto> {
    const group = await this.db.commissionGroup.findUnique({
      where: { accessCode: code },
    });
    if (!group) {
      throw new NotFoundException(`Commission group ${code} not found`);
    }
    const memberCommission = await this.db.commission.findUnique({
      where: { accessCode: dto.memberAccessCode },
    });
    if (!memberCommission || memberCommission.groupId !== group.id) {
      throw new ForbiddenException('Not a member of this group');
    }

    const comment = await this.db.comment.create({
      data: {
        groupId: group.id,
        authorRole: AuthorRole.CLIENT,
        authorClientId: memberCommission.clientId,
        visibility: Visibility.CLIENT,
        body: dto.body,
      },
    });
    return toCommentDto(comment);
  }

  private async assertOwned(
    artistId: string,
    id: string,
  ): Promise<CommissionGroup> {
    const row = await this.db.commissionGroup.findUnique({ where: { id } });
    if (!row || row.artistId !== artistId) {
      throw new NotFoundException(`Commission group ${id} not found`);
    }
    return row;
  }
}

function toGroupCommissionDto(row: {
  id: string;
  status: string;
  createdAt: Date;
  client: { id: string; name: string };
}): CommissionGroupCommissionDto {
  return {
    id: row.id,
    clientId: row.client.id,
    clientName: row.client.name,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

function toGroupDto(row: GroupWithMembers): CommissionGroupDto {
  return {
    id: row.id,
    artistId: row.artistId,
    title: row.title,
    description: row.description,
    projectId: row.projectId,
    accessCode: row.accessCode,
    currency: row.currency,
    quote: row.quote,
    members: row.members.map((member) => ({
      clientId: member.client.id,
      name: member.client.name,
      email: member.client.email,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
