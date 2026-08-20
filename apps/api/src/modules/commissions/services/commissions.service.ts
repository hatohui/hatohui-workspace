import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { EmailService } from '@/infra/email';
import {
  AppScope,
  type Commission,
  type Prisma,
  type User,
} from '@prisma/client';
import type {
  CommissionSortOption,
  SortDirection,
} from '@/modules/commissions/commissions.constants';
import { PaginatedCommissionsDto } from '@/modules/commissions/dto/commission-query.dto';
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
} from '@/modules/commissions/dto/commission.dto';
import {
  CommissionDetailDto,
  CommissionPublicDetailDto,
} from '@/modules/commissions/dto/commission-detail.dto';
import {
  CommissionNoteDto,
  CreateCommissionNoteDto,
} from '@/modules/commissions/dto/commission-note.dto';
import { CommissionStatusHistoryDto } from '@/modules/commissions/dto/commission-history.dto';
import { CommissionQueueDto } from '@/modules/commissions/dto/commission-queue.dto';
import { CommissionNoteVisibility } from '@prisma/client';
import {
  COMMISSION_RECEIVED_NOTIFICATION_CONFIG_TYPE,
  DELIVERY_EMAIL_TEMPLATE_CONFIG_TYPE,
  NEW_COMMISSION_EMAIL_TEMPLATE_CONFIG_TYPE,
  QUEUE_STATUSES,
  QUEUE_STATUS_RANK,
} from '@/modules/commissions/commissions.constants';

const SORT_FIELD: Record<CommissionSortOption, keyof Commission> = {
  createdAt: 'createdAt',
  deadline: 'deadline',
  quote: 'quoteCents',
};

@Injectable()
export class CommissionsService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly email: EmailService,
  ) {}

  async submit(dto: SubmitCommissionDto): Promise<CommissionDto> {
    const commission = await this.db.commission.create({
      data: {
        title: dto.title,
        description: dto.description,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        commissionType: dto.commissionType ?? null,
        optionKey: dto.optionKey ?? null,
        addonKeys: dto.addonKeys ?? [],
        clientName: dto.clientName,
        clientEmail: dto.clientEmail,
        preferredContactMethod: dto.preferredContactMethod ?? undefined,
        contactHandle: dto.contactHandle ?? null,
        referenceAssets:
          dto.referenceAssets?.map((key) => this.storage.getPublicUrl(key)) ??
          [],
        isHidden: !dto.isPublic,
      },
    });

    await this.notifyCommissionReceived(commission);

    return toCommissionDto(commission);
  }

  async list(
    query: string | undefined,
    status: Commission['status'] | undefined,
    sort: CommissionSortOption,
    direction: SortDirection,
    page: number,
    pageSize: number,
  ): Promise<PaginatedCommissionsDto> {
    const where: Prisma.CommissionWhereInput = {
      AND: [
        status ? { status } : {},
        query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { clientName: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [items, total] = await Promise.all([
      this.db.commission.findMany({
        where,
        orderBy: { [SORT_FIELD[sort]]: direction },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.commission.count({ where }),
    ]);

    return {
      items: items.map(toCommissionDto),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }

  async findOne(id: string): Promise<CommissionDetailDto> {
    const commission = await this.findOrThrow(id);
    return this.withNotesAndHistory(commission);
  }

  async findByAccessCode(code: string): Promise<CommissionPublicDetailDto> {
    const commission = await this.findByAccessCodeOrThrow(code);
    const notes = await this.db.commissionNote.findMany({
      where: {
        commissionId: commission.id,
        visibility: CommissionNoteVisibility.CLIENT,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { ...toPublicDto(commission), notes: notes.map(toNoteDto) };
  }

  async findByEmail(email: string): Promise<CommissionPublicDto[]> {
    const commissions = await this.db.commission.findMany({
      where: { clientEmail: email },
      orderBy: { createdAt: 'desc' },
    });
    return commissions.map(toPublicDto);
  }

  async queue(): Promise<CommissionQueueDto> {
    const commissions = await this.db.commission.findMany({
      where: { isHidden: false, status: { in: QUEUE_STATUSES } },
      orderBy: { createdAt: 'asc' },
    });

    const sorted = [...commissions].sort((a, b) => {
      const rankDiff =
        (QUEUE_STATUS_RANK.get(a.status) ?? 0) -
        (QUEUE_STATUS_RANK.get(b.status) ?? 0);
      return rankDiff !== 0
        ? rankDiff
        : a.createdAt.getTime() - b.createdAt.getTime();
    });

    return {
      items: sorted.map((commission) => ({
        id: commission.id,
        title: commission.title,
        status: commission.status,
        commissionType: commission.commissionType,
        createdAt: commission.createdAt.toISOString(),
      })),
    };
  }

  async addClientReferenceAssets(
    code: string,
    dto: AddReferenceAssetsDto,
  ): Promise<CommissionPublicDto> {
    const existing = await this.findByAccessCodeOrThrow(code);
    const commission = await this.db.commission.update({
      where: { id: existing.id },
      data: {
        referenceAssets: [
          ...existing.referenceAssets,
          ...dto.keys.map((key) => this.storage.getPublicUrl(key)),
        ],
      },
    });
    return toPublicDto(commission);
  }

  async addClientNote(code: string, body: string): Promise<CommissionNoteDto> {
    const existing = await this.findByAccessCodeOrThrow(code);
    const note = await this.db.commissionNote.create({
      data: {
        commissionId: existing.id,
        authorId: null,
        visibility: CommissionNoteVisibility.CLIENT,
        body,
      },
    });
    return toNoteDto(note);
  }

  async updateStatus(
    id: string,
    dto: UpdateCommissionStatusDto,
    viewer: User,
  ): Promise<CommissionDto> {
    const existing = await this.findOrThrow(id);

    const [commission] = await this.db.$transaction([
      this.db.commission.update({
        where: { id },
        data: { status: dto.status },
      }),
      this.db.commissionStatusHistory.create({
        data: {
          commissionId: id,
          fromStatus: existing.status,
          toStatus: dto.status,
          changedById: viewer.id,
          note: dto.note ?? null,
        },
      }),
    ]);

    return toCommissionDto(commission);
  }

  async updatePaymentStatus(
    id: string,
    dto: UpdatePaymentStatusDto,
  ): Promise<CommissionDto> {
    await this.findOrThrow(id);
    const commission = await this.db.commission.update({
      where: { id },
      data: { paymentStatus: dto.paymentStatus },
    });
    return toCommissionDto(commission);
  }

  async updateStep(
    id: string,
    dto: UpdateCommissionStepDto,
  ): Promise<CommissionDto> {
    await this.findOrThrow(id);
    const commission = await this.db.commission.update({
      where: { id },
      data: { [dto.step]: dto.done ? new Date() : null },
    });
    return toCommissionDto(commission);
  }

  async updateQuote(
    id: string,
    dto: UpdateCommissionQuoteDto,
  ): Promise<CommissionDto> {
    await this.findOrThrow(id);
    const commission = await this.db.commission.update({
      where: { id },
      data: {
        commissionType:
          dto.commissionType === undefined ? undefined : dto.commissionType,
        optionKey: dto.optionKey === undefined ? undefined : dto.optionKey,
        addonKeys: dto.addonKeys,
        quoteCents: dto.quoteCents === undefined ? undefined : dto.quoteCents,
      },
    });
    return toCommissionDto(commission);
  }

  async updateVisibility(
    id: string,
    dto: UpdateCommissionVisibilityDto,
  ): Promise<CommissionDto> {
    await this.findOrThrow(id);
    const commission = await this.db.commission.update({
      where: { id },
      data: { isHidden: dto.isHidden },
    });
    return toCommissionDto(commission);
  }

  async deliver(id: string, dto: DeliverCommissionDto): Promise<CommissionDto> {
    const existing = await this.findOrThrow(id);
    const commission = await this.db.commission.update({
      where: { id },
      data: {
        deliverableAssets: dto.deliverableAssets.map((key) =>
          this.storage.getPublicUrl(key),
        ),
        deliveredAt: new Date(),
      },
    });

    const templateId = await this.getTemplateId(
      DELIVERY_EMAIL_TEMPLATE_CONFIG_TYPE,
    );
    if (templateId) {
      await this.email.sendTemplateEmail({
        to: [{ email: existing.clientEmail, name: existing.clientName }],
        templateId,
        params: {
          title: existing.title,
          deliverableAssets: commission.deliverableAssets,
        },
      });
    }

    return toCommissionDto(commission);
  }

  async assign(id: string, dto: AssignCommissionDto): Promise<CommissionDto> {
    await this.findOrThrow(id);
    const commission = await this.db.commission.update({
      where: { id },
      data: { assignedToId: dto.assignedToId ?? null },
    });
    return toCommissionDto(commission);
  }

  async updateProject(
    id: string,
    dto: UpdateCommissionProjectDto,
  ): Promise<CommissionDto> {
    await this.findOrThrow(id);
    const commission = await this.db.commission.update({
      where: { id },
      data: { projectId: dto.projectId ?? null },
    });
    return toCommissionDto(commission);
  }

  async addNote(
    id: string,
    dto: CreateCommissionNoteDto,
    author: User,
  ): Promise<CommissionNoteDto> {
    await this.findOrThrow(id);
    const note = await this.db.commissionNote.create({
      data: {
        commissionId: id,
        authorId: author.id,
        visibility: dto.visibility,
        body: dto.body,
      },
    });
    return toNoteDto(note);
  }

  private async withNotesAndHistory(
    commission: Commission,
  ): Promise<CommissionDetailDto> {
    const [notes, history] = await Promise.all([
      this.db.commissionNote.findMany({
        where: { commissionId: commission.id },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.commissionStatusHistory.findMany({
        where: { commissionId: commission.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      ...toCommissionDto(commission),
      notes: notes.map(toNoteDto),
      history: history.map(toHistoryDto),
    };
  }

  private async notifyCommissionReceived(
    commission: Commission,
  ): Promise<void> {
    const config = await this.db.systemParameters.findUnique({
      where: {
        type_scope: {
          type: COMMISSION_RECEIVED_NOTIFICATION_CONFIG_TYPE,
          scope: AppScope.ART,
        },
      },
    });
    if (!config) return;

    const templateId = await this.getTemplateId(
      NEW_COMMISSION_EMAIL_TEMPLATE_CONFIG_TYPE,
    );
    if (!templateId) return;

    await this.email.sendTemplateEmail({
      to: [{ email: config.value }],
      templateId,
      params: {
        commissionId: commission.id,
        title: commission.title,
        clientName: commission.clientName,
        clientEmail: commission.clientEmail,
      },
    });
  }

  private async getTemplateId(configType: string): Promise<number | null> {
    const config = await this.db.systemParameters.findUnique({
      where: { type_scope: { type: configType, scope: AppScope.ART } },
    });
    const parsed = config ? Number(config.value) : NaN;
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  private async findOrThrow(id: string): Promise<Commission> {
    const commission = await this.db.commission.findUnique({ where: { id } });
    if (!commission) {
      throw new NotFoundException(`Commission ${id} not found`);
    }
    return commission;
  }

  private async findByAccessCodeOrThrow(code: string): Promise<Commission> {
    const commission = await this.db.commission.findUnique({
      where: { accessCode: code },
    });
    if (!commission) {
      throw new NotFoundException('Commission not found');
    }
    return commission;
  }
}

function toCommissionDto(commission: Commission): CommissionDto {
  return {
    id: commission.id,
    title: commission.title,
    description: commission.description,
    deadline: commission.deadline?.toISOString() ?? null,
    status: commission.status,
    paymentStatus: commission.paymentStatus,
    isHidden: commission.isHidden,
    commissionType: commission.commissionType,
    optionKey: commission.optionKey,
    addonKeys: commission.addonKeys,
    quoteCents: commission.quoteCents,
    clientName: commission.clientName,
    clientEmail: commission.clientEmail,
    preferredContactMethod: commission.preferredContactMethod,
    contactHandle: commission.contactHandle,
    referenceAssets: commission.referenceAssets,
    deliverableAssets: commission.deliverableAssets,
    deliveredAt: commission.deliveredAt?.toISOString() ?? null,
    steps: {
      ideaConfirmedAt: commission.ideaConfirmedAt?.toISOString() ?? null,
      sketchConfirmedAt: commission.sketchConfirmedAt?.toISOString() ?? null,
      paymentConfirmedAt: commission.paymentConfirmedAt?.toISOString() ?? null,
      lineDoneAt: commission.lineDoneAt?.toISOString() ?? null,
      coloringDoneAt: commission.coloringDoneAt?.toISOString() ?? null,
      finishedAt: commission.finishedAt?.toISOString() ?? null,
    },
    assignedToId: commission.assignedToId,
    projectId: commission.projectId,
    createdAt: commission.createdAt.toISOString(),
    updatedAt: commission.updatedAt.toISOString(),
  };
}

function toPublicDto(commission: Commission): CommissionPublicDto {
  return {
    id: commission.id,
    accessCode: commission.accessCode,
    title: commission.title,
    description: commission.description,
    deadline: commission.deadline?.toISOString() ?? null,
    status: commission.status,
    paymentStatus: commission.paymentStatus,
    commissionType: commission.commissionType,
    quoteCents: commission.quoteCents,
    referenceAssets: commission.referenceAssets,
    deliverableAssets: commission.deliverableAssets,
    deliveredAt: commission.deliveredAt?.toISOString() ?? null,
    createdAt: commission.createdAt.toISOString(),
    updatedAt: commission.updatedAt.toISOString(),
  };
}

function toNoteDto(note: {
  id: string;
  commissionId: string;
  authorId: string | null;
  visibility: CommissionNoteDto['visibility'];
  body: string;
  createdAt: Date;
}): CommissionNoteDto {
  return {
    id: note.id,
    commissionId: note.commissionId,
    authorId: note.authorId,
    visibility: note.visibility,
    body: note.body,
    createdAt: note.createdAt.toISOString(),
  };
}

function toHistoryDto(history: {
  id: string;
  commissionId: string;
  fromStatus: Commission['status'] | null;
  toStatus: Commission['status'];
  changedById: string;
  note: string | null;
  createdAt: Date;
}): CommissionStatusHistoryDto {
  return {
    id: history.id,
    commissionId: history.commissionId,
    fromStatus: history.fromStatus,
    toStatus: history.toStatus,
    changedById: history.changedById,
    note: history.note,
    createdAt: history.createdAt.toISOString(),
  };
}
