import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { EmailService } from '@/infra/email';
import { USER_SETTING_TYPES } from '@/modules/user-settings/user-settings.constants';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';
import {
  AppScope,
  Visibility,
  type Client,
  type Commission,
  type CommissionDetail,
  type CommissionType,
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
  CommissionDto,
  CommissionPublicDto,
  CreatePrivateCommissionDto,
  DeliverCommissionDto,
  SendConfirmationEmailDto,
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
  toCommentDto,
} from '@/modules/commissions/dto/comment.dto';
import { CommissionStatusHistoryDto } from '@/modules/commissions/dto/commission-history.dto';
import { CommissionQueueDto } from '@/modules/commissions/dto/commission-queue.dto';
import {
  CONFIRMATION_EMAIL_TEMPLATE_CONFIG_TYPE,
  DELIVERY_EMAIL_TEMPLATE_CONFIG_TYPE,
  NEW_COMMISSION_EMAIL_TEMPLATE_CONFIG_TYPE,
  QUEUE_STATUSES,
  QUEUE_STATUS_RANK,
} from '@/modules/commissions/commissions.constants';
import { CommissionOpeningsService } from '@/modules/commission-openings/services/commission-openings.service';

const DEFAULT_CURRENCY = 'USD';

type CommissionWithRelations = Commission & {
  detail: (CommissionDetail & { commissionType: CommissionType | null }) | null;
  client: Client;
};

const commissionInclude = {
  detail: { include: { commissionType: true } },
  client: true,
} satisfies Prisma.CommissionInclude;

@Injectable()
export class CommissionsService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly email: EmailService,
    private readonly userSettings: UserSettingsService,
    private readonly commissionOpenings: CommissionOpeningsService,
  ) {}

  async submit(dto: SubmitCommissionDto): Promise<CommissionDto> {
    const currency = await this.currencyFor(dto.artistId);
    const client = await this.resolveClient(dto);

    const commission = await this.db.commission.create({
      data: {
        artistId: dto.artistId,
        clientId: client.id,
        commissionOpeningId: dto.commissionOpeningId ?? null,
        status: 'PENDING',
        detail: {
          create: {
            idea: dto.idea,
            deadline: dto.deadline ? new Date(dto.deadline) : null,
            commissionTypeId: dto.commissionTypeId ?? null,
            optionKey: dto.optionKey ?? null,
            addonKeys: dto.addonKeys ?? [],
            currency,
            referenceAssets:
              dto.referenceAssets?.map((key) =>
                this.storage.getPublicUrl(key),
              ) ?? [],
            isHiddenInQueue: !dto.isPublic,
          },
        },
      },
      include: commissionInclude,
    });

    await this.notifyCommissionReceived(commission);

    return toCommissionDto(commission);
  }

  async createPrivate(
    artistId: string,
    dto: CreatePrivateCommissionDto,
  ): Promise<CommissionDto> {
    const currency = await this.currencyFor(artistId);
    const client = await this.resolveClient(dto);

    const commission = await this.db.commission.create({
      data: {
        artistId,
        clientId: client.id,
        status: 'NOT_YET_STARTED',
        detail: {
          create: {
            idea: dto.idea,
            deadline: dto.deadline ? new Date(dto.deadline) : null,
            commissionTypeId: dto.commissionTypeId ?? null,
            optionKey: dto.optionKey ?? null,
            addonKeys: dto.addonKeys ?? [],
            currency,
            referenceAssets:
              dto.referenceAssets?.map((key) =>
                this.storage.getPublicUrl(key),
              ) ?? [],
            isHiddenInQueue: !dto.isPublic,
          },
        },
      },
      include: commissionInclude,
    });

    return toCommissionDto(commission);
  }

  async list(
    artistId: string,
    query: string | undefined,
    status: Commission['status'] | undefined,
    sort: CommissionSortOption,
    direction: SortDirection,
    page: number,
    pageSize: number,
  ): Promise<PaginatedCommissionsDto> {
    const where: Prisma.CommissionWhereInput = {
      artistId,
      AND: [
        status ? { status } : {},
        query
          ? { client: { name: { contains: query, mode: 'insensitive' } } }
          : {},
      ],
    };

    // 'deadline' and 'priority' are nullable — nulls sort last, with
    // createdAt as the tiebreak among them, so "no deadline"/"no custom
    // priority" falls back to submission order rather than clustering
    // arbitrarily (PRD: "undated items fall back to submission time").
    const orderBy: Prisma.CommissionOrderByWithRelationInput[] =
      sort === 'quote'
        ? [{ detail: { quote: direction } }]
        : sort === 'deadline'
          ? [
              { detail: { deadline: { sort: direction, nulls: 'last' } } },
              { createdAt: direction },
            ]
          : sort === 'priority'
            ? [
                { priority: { sort: direction, nulls: 'last' } },
                { createdAt: direction },
              ]
            : [{ createdAt: direction }];

    const [items, total] = await Promise.all([
      this.db.commission.findMany({
        where,
        include: commissionInclude,
        orderBy,
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

  async findOne(artistId: string, id: string): Promise<CommissionDetailDto> {
    const commission = await this.findOwnedOrThrow(artistId, id);
    return this.withCommentsAndHistory(commission);
  }

  async findByAccessCode(code: string): Promise<CommissionPublicDetailDto> {
    const commission = await this.findByAccessCodeOrThrow(code);
    const comments = await this.db.comment.findMany({
      where: { commissionId: commission.id, visibility: Visibility.CLIENT },
      orderBy: { createdAt: 'desc' },
    });
    return { ...toPublicDto(commission), comments: comments.map(toCommentDto) };
  }

  async findByEmail(email: string): Promise<CommissionPublicDto[]> {
    const commissions = await this.db.commission.findMany({
      where: { client: { email } },
      include: commissionInclude,
      orderBy: { createdAt: 'desc' },
    });
    return commissions.map(toPublicDto);
  }

  async queue(artistId: string): Promise<CommissionQueueDto> {
    const commissions = await this.db.commission.findMany({
      where: {
        artistId,
        status: { in: QUEUE_STATUSES },
        detail: { isHiddenInQueue: false },
      },
      include: commissionInclude,
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
        status: commission.status,
        commissionTypeKey: commission.detail?.commissionType?.key ?? null,
        createdAt: commission.createdAt.toISOString(),
      })),
    };
  }

  async addClientReferenceAssets(
    code: string,
    dto: AddReferenceAssetsDto,
  ): Promise<CommissionPublicDto> {
    const existing = await this.findByAccessCodeOrThrow(code);
    const detail = requireDetail(existing);
    await this.db.commissionDetail.update({
      where: { commissionId: existing.id },
      data: {
        referenceAssets: [
          ...detail.referenceAssets,
          ...(dto.keys ?? []).map((key) => this.storage.getPublicUrl(key)),
          ...(dto.urls ?? []),
        ],
      },
    });
    const commission = await this.findByAccessCodeOrThrow(code);
    return toPublicDto(commission);
  }

  async addClientNote(code: string, body: string): Promise<CommentDto> {
    const existing = await this.findByAccessCodeOrThrow(code);
    const comment = await this.db.comment.create({
      data: {
        commissionId: existing.id,
        authorRole: 'CLIENT',
        authorClientId: existing.clientId,
        visibility: Visibility.CLIENT,
        body,
      },
    });
    return toCommentDto(comment);
  }

  async updateStatus(
    artistId: string,
    id: string,
    dto: UpdateCommissionStatusDto,
    viewer: User,
  ): Promise<CommissionDto> {
    const existing = await this.findOwnedOrThrow(artistId, id);

    // Snapshot the quote the moment a commission is first accepted, so a
    // later price change can be detected before sending the confirmation
    // email — see PRD Use Case 3.
    const justAccepted =
      dto.status === 'ACCEPTED' && existing.status !== 'ACCEPTED';

    await this.db.$transaction([
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
      ...(justAccepted
        ? [
            this.db.commissionDetail.update({
              where: { commissionId: id },
              data: { originalQuote: existing.detail?.quote ?? null },
            }),
          ]
        : []),
    ]);

    // Re-fetch rather than trust the transaction's own update result: its
    // `include` is evaluated at that query's turn, before the quote-snapshot
    // write later in the same transaction — using it directly would report
    // a stale (pre-snapshot) originalQuote on exactly the call that set it.
    const commission = await this.findOwnedOrThrow(artistId, id);

    if (commission.commissionOpeningId) {
      await this.commissionOpenings.maybeAutoCloseForSlotCap(
        commission.commissionOpeningId,
      );
    }

    return toCommissionDto(commission);
  }

  async updatePaymentStatus(
    artistId: string,
    id: string,
    dto: UpdatePaymentStatusDto,
  ): Promise<CommissionDto> {
    await this.findOwnedOrThrow(artistId, id);
    await this.db.commissionDetail.update({
      where: { commissionId: id },
      data: { paymentStatus: dto.paymentStatus },
    });
    const commission = await this.findOwnedOrThrow(artistId, id);
    return toCommissionDto(commission);
  }

  async updateStep(
    artistId: string,
    id: string,
    dto: UpdateCommissionStepDto,
  ): Promise<CommissionDto> {
    await this.findOwnedOrThrow(artistId, id);
    await this.db.commissionDetail.update({
      where: { commissionId: id },
      data: { [dto.step]: dto.done ? new Date() : null },
    });
    const commission = await this.findOwnedOrThrow(artistId, id);
    return toCommissionDto(commission);
  }

  async updateQuote(
    artistId: string,
    id: string,
    dto: UpdateCommissionQuoteDto,
  ): Promise<CommissionDto> {
    await this.findOwnedOrThrow(artistId, id);
    await this.db.commissionDetail.update({
      where: { commissionId: id },
      data: {
        commissionTypeId:
          dto.commissionTypeId === undefined ? undefined : dto.commissionTypeId,
        optionKey: dto.optionKey === undefined ? undefined : dto.optionKey,
        addonKeys: dto.addonKeys,
        quote: dto.quote === undefined ? undefined : dto.quote,
      },
    });
    const commission = await this.findOwnedOrThrow(artistId, id);
    return toCommissionDto(commission);
  }

  async updateVisibility(
    artistId: string,
    id: string,
    dto: UpdateCommissionVisibilityDto,
  ): Promise<CommissionDto> {
    await this.findOwnedOrThrow(artistId, id);
    await this.db.commissionDetail.update({
      where: { commissionId: id },
      data: { isHiddenInQueue: dto.isHiddenInQueue },
    });
    const commission = await this.findOwnedOrThrow(artistId, id);
    return toCommissionDto(commission);
  }

  async deliver(
    artistId: string,
    id: string,
    dto: DeliverCommissionDto,
  ): Promise<CommissionDto> {
    const existing = await this.findOwnedOrThrow(artistId, id);
    const images = dto.images.map((key) => this.storage.getPublicUrl(key));

    await this.db.$transaction([
      this.db.commissionProgress.create({
        data: {
          commissionId: id,
          images,
          isFinal: true,
          visibility: Visibility.CLIENT,
        },
      }),
      this.db.commissionDetail.update({
        where: { commissionId: id },
        data: { deliveredAt: new Date() },
      }),
    ]);

    const commission = await this.findOwnedOrThrow(artistId, id);

    const templateId = await this.getTemplateId(
      DELIVERY_EMAIL_TEMPLATE_CONFIG_TYPE,
    );
    if (templateId) {
      await this.email.sendTemplateEmail({
        to: [{ email: existing.client.email, name: existing.client.name }],
        templateId,
        params: {
          label: commissionDisplayLabel(
            commission.detail?.commissionType ?? null,
            existing.client.name,
          ),
          images,
        },
      });
    }

    return toCommissionDto(commission);
  }

  async updatePriority(
    artistId: string,
    id: string,
    priority: number | null,
  ): Promise<CommissionDto> {
    await this.findOwnedOrThrow(artistId, id);
    const commission = await this.db.commission.update({
      where: { id },
      data: { priority },
      include: commissionInclude,
    });
    return toCommissionDto(commission);
  }

  /// Deletion is always a deliberate per-item action (PRD "Closing vs
  /// deleting") — it removes the record *and* its uploaded reference images
  /// from storage, so no orphaned objects are left behind. CommissionDetail/
  /// Comment/CommissionProgress cascade at the DB level; CommissionStatusHistory
  /// doesn't (no onDelete: Cascade on that relation), so it's cleared first.
  async remove(artistId: string, id: string): Promise<void> {
    const existing = await this.findOwnedOrThrow(artistId, id);

    await this.db.$transaction([
      this.db.commissionStatusHistory.deleteMany({
        where: { commissionId: id },
      }),
      this.db.commission.delete({ where: { id } }),
    ]);

    for (const url of existing.detail?.referenceAssets ?? []) {
      const key = this.storage.getKeyFromUrl(url);
      if (key) await this.storage.deleteObject(key).catch(() => {});
    }
  }

  /// "Confirm" (Use Case 3) — sends the client an email asking them to
  /// confirm the accepted quote. Requires an explanatory note if the quote
  /// has changed since acceptance (`originalQuote`), since silently emailing
  /// a different number than what the client agreed to isn't acceptable.
  async sendConfirmationEmail(
    artistId: string,
    id: string,
    dto: SendConfirmationEmailDto,
  ): Promise<void> {
    const commission = await this.findOwnedOrThrow(artistId, id);
    const detail = requireDetail(commission);

    const quoteChanged =
      detail.originalQuote != null && detail.quote !== detail.originalQuote;
    if (quoteChanged && !dto.note) {
      throw new BadRequestException(
        'A note is required: the quote changed since this commission was accepted',
      );
    }

    const templateId = await this.getTemplateId(
      CONFIRMATION_EMAIL_TEMPLATE_CONFIG_TYPE,
    );
    if (!templateId) return;

    await this.email.sendTemplateEmail({
      to: [{ email: commission.client.email, name: commission.client.name }],
      templateId,
      params: {
        label: commissionDisplayLabel(
          detail.commissionType ?? null,
          commission.client.name,
        ),
        quote: detail.quote,
        currency: detail.currency,
        note: dto.note ?? null,
      },
    });
  }

  async addNote(
    artistId: string,
    id: string,
    dto: CreateCommentDto,
  ): Promise<CommentDto> {
    await this.findOwnedOrThrow(artistId, id);
    const comment = await this.db.comment.create({
      data: {
        commissionId: id,
        authorRole: 'ARTIST',
        visibility: dto.visibility,
        body: dto.body,
      },
    });
    return toCommentDto(comment);
  }

  private async currencyFor(artistId: string): Promise<string> {
    const setting = USER_SETTING_TYPES.commissionCurrency;
    const value = await this.userSettings.get(
      artistId,
      setting.scope,
      setting.type,
    );
    return value ?? DEFAULT_CURRENCY;
  }

  private async notificationEmailFor(artistId: string): Promise<string | null> {
    const setting = USER_SETTING_TYPES.commissionNotificationEmail;
    const configured = await this.userSettings.get(
      artistId,
      setting.scope,
      setting.type,
    );
    if (configured) return configured;

    const artist = await this.db.user.findUnique({
      where: { id: artistId },
      select: { email: true },
    });
    return artist?.email ?? null;
  }

  private async resolveClient(dto: {
    clientName: string;
    clientEmail: string;
    preferredContactMethod?: SubmitCommissionDto['preferredContactMethod'];
    contactHandle?: string;
  }): Promise<Client> {
    return this.db.client.upsert({
      where: { email: dto.clientEmail },
      update: {
        name: dto.clientName,
        preferredContactMethod: dto.preferredContactMethod ?? undefined,
        contactHandle: dto.contactHandle ?? undefined,
      },
      create: {
        email: dto.clientEmail,
        name: dto.clientName,
        preferredContactMethod: dto.preferredContactMethod ?? undefined,
        contactHandle: dto.contactHandle ?? null,
      },
    });
  }

  private async withCommentsAndHistory(
    commission: CommissionWithRelations,
  ): Promise<CommissionDetailDto> {
    const [comments, history] = await Promise.all([
      this.db.comment.findMany({
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
      comments: comments.map(toCommentDto),
      history: history.map(toHistoryDto),
    };
  }

  private async notifyCommissionReceived(
    commission: CommissionWithRelations,
  ): Promise<void> {
    const notifyEmail = await this.notificationEmailFor(commission.artistId);
    if (!notifyEmail) return;

    const templateId = await this.getTemplateId(
      NEW_COMMISSION_EMAIL_TEMPLATE_CONFIG_TYPE,
    );
    if (!templateId) return;

    await this.email.sendTemplateEmail({
      to: [{ email: notifyEmail }],
      templateId,
      params: {
        commissionId: commission.id,
        label: commissionDisplayLabel(
          commission.detail?.commissionType ?? null,
          commission.client.name,
        ),
        clientName: commission.client.name,
        clientEmail: commission.client.email,
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

  private async findOwnedOrThrow(
    artistId: string,
    id: string,
  ): Promise<CommissionWithRelations> {
    const commission = await this.db.commission.findUnique({
      where: { id },
      include: commissionInclude,
    });
    if (!commission || commission.artistId !== artistId) {
      throw new NotFoundException(`Commission ${id} not found`);
    }
    return commission;
  }

  private async findByAccessCodeOrThrow(
    code: string,
  ): Promise<CommissionWithRelations> {
    const commission = await this.db.commission.findUnique({
      where: { accessCode: code },
      include: commissionInclude,
    });
    if (!commission) {
      throw new NotFoundException('Commission not found');
    }
    return commission;
  }
}

function requireDetail(
  commission: CommissionWithRelations,
): CommissionDetail & { commissionType: CommissionType | null } {
  if (!commission.detail) {
    throw new NotFoundException(
      `Commission ${commission.id} has no detail row`,
    );
  }
  return commission.detail;
}

function commissionDisplayLabel(
  commissionType: CommissionType | null,
  clientName: string,
): string {
  return `${commissionType?.key ?? 'Commission'} — ${clientName}`;
}

function toCommissionDto(commission: CommissionWithRelations): CommissionDto {
  const detail = requireDetail(commission);
  return {
    id: commission.id,
    artistId: commission.artistId,
    clientId: commission.clientId,
    commissionOpeningId: commission.commissionOpeningId,
    groupId: commission.groupId,
    paymentMethodId: commission.paymentMethodId,
    status: commission.status,
    priority: commission.priority,
    idea: detail.idea,
    deadline: detail.deadline?.toISOString() ?? null,
    paymentStatus: detail.paymentStatus,
    isHiddenInQueue: detail.isHiddenInQueue,
    commissionTypeId: detail.commissionTypeId,
    commissionTypeKey: detail.commissionType?.key ?? null,
    optionKey: detail.optionKey,
    addonKeys: detail.addonKeys,
    currency: detail.currency,
    quote: detail.quote,
    originalQuote: detail.originalQuote,
    clientName: commission.client.name,
    clientEmail: commission.client.email,
    preferredContactMethod: commission.client.preferredContactMethod,
    contactHandle: commission.client.contactHandle,
    referenceAssets: detail.referenceAssets,
    deliveredAt: detail.deliveredAt?.toISOString() ?? null,
    steps: {
      ideaConfirmedAt: detail.ideaConfirmedAt?.toISOString() ?? null,
      sketchConfirmedAt: detail.sketchConfirmedAt?.toISOString() ?? null,
      paymentConfirmedAt: detail.paymentConfirmedAt?.toISOString() ?? null,
      lineDoneAt: detail.lineDoneAt?.toISOString() ?? null,
      coloringDoneAt: detail.coloringDoneAt?.toISOString() ?? null,
      finishedAt: detail.finishedAt?.toISOString() ?? null,
    },
    createdAt: commission.createdAt.toISOString(),
    updatedAt: commission.updatedAt.toISOString(),
  };
}

function toPublicDto(commission: CommissionWithRelations): CommissionPublicDto {
  const detail = requireDetail(commission);
  return {
    id: commission.id,
    accessCode: commission.accessCode,
    idea: detail.idea,
    deadline: detail.deadline?.toISOString() ?? null,
    status: commission.status,
    paymentStatus: detail.paymentStatus,
    commissionTypeId: detail.commissionTypeId,
    commissionTypeKey: detail.commissionType?.key ?? null,
    currency: detail.currency,
    quote: detail.quote,
    referenceAssets: detail.referenceAssets,
    deliveredAt: detail.deliveredAt?.toISOString() ?? null,
    createdAt: commission.createdAt.toISOString(),
    updatedAt: commission.updatedAt.toISOString(),
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
