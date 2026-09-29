import {
  BadRequestException,
  ForbiddenException,
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
  CommissionView,
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
  SendQuoteDto,
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
  toClientCommentDto,
  toCommentDto,
} from '@/modules/commissions/dto/comment.dto';
import {
  CreateClientNoteDto,
  UpdateClientPreferencesDto,
} from '@/modules/commissions/dto/commission-lookup.dto';
import { CommissionAttachmentsService } from '@/modules/commission-attachments/services/commission-attachments.service';
import { CommissionStatusHistoryDto } from '@/modules/commissions/dto/commission-history.dto';
import {
  CommissionQueueDto,
  CommissionQueuePlacementDto,
} from '@/modules/commissions/dto/commission-queue.dto';
import {
  CLIENT_PASSCODE_STATUSES,
  EMAIL_CONTACT_PLATFORM,
  COMMISSION_VIEW_STATUSES,
  CONFIRMATION_EMAIL_TEMPLATE_CONFIG_TYPE,
  DELIVERY_EMAIL_TEMPLATE_CONFIG_TYPE,
  NEW_COMMISSION_EMAIL_TEMPLATE_CONFIG_TYPE,
  QUOTE_EMAIL_TEMPLATE_CONFIG_TYPE,
  QUEUE_STAGE_BY_STATUS,
  QUEUE_STAGES,
  QUEUE_STATUSES,
  QUEUE_STATUS_RANK,
  COMMISSION_MIN_DEADLINE_DAYS,
  DEADLINE_TIMEZONE_SLACK_DAYS,
} from '@/modules/commissions/commissions.constants';
import { CommissionOpeningsService } from '@/modules/commission-openings/services/commission-openings.service';
import { CommissionPricingService } from '@/modules/commission-pricing/services/commission-pricing.service';
import { CommissionPurgeService } from '@/modules/commission-purge/services/commission-purge.service';
import { ClientIdentityService } from '@/modules/clients/services/client-identity.service';
import {
  isEmailContact,
  platformForContactMethod,
  type ContactPoint,
} from '@/modules/clients/utils/contact-points';

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
    private readonly pricing: CommissionPricingService,
    private readonly clientIdentity: ClientIdentityService,
    private readonly attachments: CommissionAttachmentsService,
    private readonly purge: CommissionPurgeService,
  ) {}

  async submit(
    dto: SubmitCommissionDto,
    submitter: User | null,
  ): Promise<CommissionDto> {
    assertDeadlineFarEnough(dto.deadline);
    const allowGalleryPost = await this.galleryPostFor(
      dto.artistId,
      dto.allowGalleryPost,
    );
    const [currency, commissionOpeningId, estimate] = await Promise.all([
      this.currencyFor(dto.artistId),
      this.commissionOpenings.openIdFor(dto.artistId),
      this.pricing.estimate(dto.artistId, { ...dto, allowGalleryPost }),
    ]);
    if (!commissionOpeningId) {
      throw new ForbiddenException(
        'This artist is not accepting commissions right now',
      );
    }
    const { client, contact } = await this.clientIdentity.resolve(
      { ...dto, contact: submittedContact(dto) },
      submitter,
    );

    const commission = await this.db.commission.create({
      data: {
        artistId: dto.artistId,
        clientId: client.id,
        commissionOpeningId,
        allowGalleryPost,
        status: 'PENDING',
        detail: {
          create: {
            idea: dto.idea,
            deadline: dto.deadline ? new Date(dto.deadline) : null,
            commissionTypeId: dto.commissionTypeId ?? null,
            optionKey: dto.optionKey ?? null,
            addonKeys: dto.addonKeys ?? [],
            currency,
            estimateLow: estimate?.low ?? null,
            estimateHigh: estimate?.high ?? null,
            referenceAssets: [
              ...(dto.referenceAssets ?? []).map((key) =>
                this.storage.getPublicUrl(key),
              ),
              ...(dto.referenceUrls ?? []),
            ],
            isHiddenInQueue: !dto.isPublic,
            contactPlatform: contact.platform,
            contactValue: contact.value,
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
        allowGalleryPost: await this.galleryPostFor(
          artistId,
          dto.allowGalleryPost,
        ),
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
            contactPlatform: platformForContactMethod(
              client.preferredContactMethod,
            ),
            contactValue:
              client.preferredContactMethod === 'EMAIL'
                ? client.email
                : client.contactHandle,
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
    view: CommissionView | undefined,
    sort: CommissionSortOption,
    direction: SortDirection,
    page: number,
    pageSize: number,
  ): Promise<PaginatedCommissionsDto> {
    const where: Prisma.CommissionWhereInput = {
      artistId,
      AND: [
        status ? { status } : {},
        view ? { status: { in: COMMISSION_VIEW_STATUSES[view] } } : {},
        query
          ? {
              client: {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                ],
              },
            }
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

  async recent(artistId: string, take: number): Promise<CommissionDto[]> {
    const items = await this.db.commission.findMany({
      where: { artistId },
      include: commissionInclude,
      orderBy: { createdAt: 'desc' },
      take,
    });
    return items.map(toCommissionDto);
  }

  async upcomingDeadlines(
    artistId: string,
    statuses: Commission['status'][],
    take: number,
  ): Promise<CommissionDto[]> {
    const items = await this.db.commission.findMany({
      where: {
        artistId,
        status: { in: statuses },
        detail: { deadline: { not: null } },
      },
      include: commissionInclude,
      orderBy: { detail: { deadline: 'asc' } },
      take,
    });
    return items.map(toCommissionDto);
  }

  async findOne(artistId: string, id: string): Promise<CommissionDetailDto> {
    const commission = await this.findOwnedOrThrow(artistId, id);
    return this.withCommentsAndHistory(commission);
  }

  async findByAccessCode(code: string): Promise<CommissionPublicDetailDto> {
    const commission = await this.findByAccessCodeOrThrow(code);
    const [comments, workOrder] = await Promise.all([
      this.db.comment.findMany({
        where: {
          commissionId: commission.id,
          progressId: null,
          visibility: Visibility.CLIENT,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.workOrder(commission.artistId),
    ]);
    const index = workOrder.findIndex((item) => item.id === commission.id);
    return {
      ...toPublicDto(commission),
      clientName: commission.client.name,
      queue:
        index === -1
          ? null
          : toPlacement(workOrder[index], index, workOrder.length),
      comments: comments.map(toClientCommentDto),
      purgeAt:
        (await this.purge.purgeAtFor(commission.id))?.toISOString() ?? null,
    };
  }

  async updateClientPreferences(
    code: string,
    dto: UpdateClientPreferencesDto,
  ): Promise<CommissionPublicDto> {
    const { id } = await this.findByAccessCodeOrThrow(code);
    const isEmail = dto.contactPlatform === EMAIL_CONTACT_PLATFORM;
    if (dto.allowGalleryPost !== undefined) {
      await this.db.commission.update({
        where: { id },
        data: { allowGalleryPost: dto.allowGalleryPost },
      });
    }
    await this.db.commissionDetail.update({
      where: { commissionId: id },
      data: {
        isHiddenInQueue: dto.isHiddenInQueue,
        contactPlatform: dto.contactPlatform,
        contactValue: isEmail ? null : dto.contactValue?.trim(),
      },
    });
    return toPublicDto(await this.findByAccessCodeOrThrow(code));
  }

  async markSeenByClient(code: string): Promise<void> {
    const { id } = await this.findByAccessCodeOrThrow(code);
    const now = new Date();
    await this.db.$transaction([
      this.db.comment.updateMany({
        where: {
          commissionId: id,
          authorRole: 'ARTIST',
          visibility: Visibility.CLIENT,
          seenAt: null,
        },
        data: { seenAt: now },
      }),
      this.db.commissionProgress.updateMany({
        where: {
          commissionId: id,
          visibility: Visibility.CLIENT,
          seenByClientAt: null,
        },
        data: { seenByClientAt: now },
      }),
    ]);
  }

  async markSeenByArtist(artistId: string, id: string): Promise<void> {
    await this.findOwnedOrThrow(artistId, id);
    await this.db.comment.updateMany({
      where: { commissionId: id, authorRole: 'CLIENT', seenAt: null },
      data: { seenAt: new Date() },
    });
  }

  async queue(artistId: string): Promise<CommissionQueueDto> {
    const workOrder = await this.workOrder(artistId);
    return {
      items: workOrder.flatMap((commission, index) =>
        commission.detail?.isHiddenInQueue
          ? []
          : [
              {
                ...toPlacement(commission, index, workOrder.length),
                id: commission.id,
                commissionTypeKey:
                  commission.detail?.commissionType?.key ?? null,
                commissionTypeLabel:
                  commission.detail?.commissionType?.label ?? null,
                isUnlockable: commission.passcodeHash !== null,
                accessCode: commission.passcodeHash
                  ? null
                  : commission.accessCode,
                queuedAt: commission.createdAt.toISOString(),
              },
            ],
      ),
    };
  }

  private async workOrder(
    artistId: string,
  ): Promise<CommissionWithRelations[]> {
    const commissions = await this.db.commission.findMany({
      where: { artistId, status: { in: QUEUE_STATUSES } },
      include: commissionInclude,
      orderBy: { createdAt: 'asc' },
    });
    return [...commissions].sort((a, b) => {
      const rankDiff =
        (QUEUE_STATUS_RANK.get(a.status) ?? 0) -
        (QUEUE_STATUS_RANK.get(b.status) ?? 0);
      return rankDiff !== 0
        ? rankDiff
        : a.createdAt.getTime() - b.createdAt.getTime();
    });
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

  async addClientNote(
    code: string,
    dto: CreateClientNoteDto,
  ): Promise<CommentDto> {
    const existing = await this.findByAccessCodeOrThrow(code);
    const images = this.commentImages(dto);
    if (dto.progressId) {
      await this.assertProgressOf(existing.id, dto.progressId, true);
    }
    const comment = await this.db.comment.create({
      data: {
        commissionId: existing.id,
        progressId: dto.progressId ?? null,
        authorRole: 'CLIENT',
        authorClientId: existing.clientId,
        visibility: Visibility.CLIENT,
        body: dto.body.trim(),
        images,
      },
    });
    await this.attachments.claim(dto.keys ?? [], dto.body);
    return toClientCommentDto(comment);
  }

  async updateStatus(
    artistId: string,
    id: string,
    dto: UpdateCommissionStatusDto,
    viewer: User,
  ): Promise<CommissionDto> {
    const existing = await this.findOwnedOrThrow(artistId, id);
    if (existing.purgedAt) {
      throw new BadRequestException('This commission has been purged');
    }

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

    if (dto.status === 'COMPLETED') {
      await this.purge.schedule(artistId, id);
    } else if (existing.status === 'COMPLETED') {
      await this.purge.cancel(id);
    }

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
    await this.db.commission.update({
      where: { id },
      data: { allowGalleryPost: dto.allowGalleryPost },
    });
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
    const [progress, comments] = await Promise.all([
      this.db.commissionProgress.findMany({
        where: { commissionId: id },
        select: { images: true, description: true },
      }),
      this.db.comment.findMany({
        where: { commissionId: id },
        select: { images: true, body: true },
      }),
    ]);

    const images = [
      ...(existing.detail?.referenceAssets ?? []),
      ...progress.flatMap((row) => row.images),
      ...comments.flatMap((row) => row.images),
    ];
    const markdown = [
      ...progress.map((row) => row.description),
      ...comments.map((row) => row.body),
    ];

    await this.db.$transaction([
      this.attachments.queueDeletes(images, markdown),
      this.db.commissionStatusHistory.deleteMany({
        where: { commissionId: id },
      }),
      this.db.commission.delete({ where: { id } }),
    ]);

    await this.attachments.release(images, markdown);
  }

  /// "Confirm" (Use Case 3) — sends the client an email asking them to
  /// confirm the accepted quote. Requires an explanatory note if the quote
  /// has changed since acceptance (`originalQuote`), since silently emailing
  /// a different number than what the client agreed to isn't acceptable.
  async sendQuote(
    artistId: string,
    id: string,
    dto: SendQuoteDto,
    viewer: User,
  ): Promise<CommissionDto> {
    const existing = await this.findOwnedOrThrow(artistId, id);

    await this.db.$transaction([
      this.db.commissionDetail.update({
        where: { commissionId: id },
        data: { quote: dto.amount, quoteSentAt: new Date() },
      }),
      ...(dto.message
        ? [
            this.db.comment.create({
              data: {
                commissionId: id,
                authorRole: 'ARTIST',
                visibility: Visibility.CLIENT,
                body: dto.message,
              },
            }),
          ]
        : []),
    ]);

    const accepting = dto.accept === true && existing.status !== 'ACCEPTED';
    const result = accepting
      ? await this.updateStatus(artistId, id, { status: 'ACCEPTED' }, viewer)
      : toCommissionDto(await this.findOwnedOrThrow(artistId, id));

    await this.emailQuote(existing, dto, accepting);
    return result;
  }

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
    const images = this.commentImages(dto);
    if (dto.progressId) await this.assertProgressOf(id, dto.progressId, false);
    const comment = await this.db.comment.create({
      data: {
        commissionId: id,
        progressId: dto.progressId ?? null,
        authorRole: 'ARTIST',
        visibility: dto.visibility,
        body: dto.body.trim(),
        images,
      },
    });
    await this.attachments.claim(dto.keys ?? [], dto.body);
    return toCommentDto(comment);
  }

  private async galleryPostFor(
    artistId: string,
    requested: boolean | undefined,
  ): Promise<boolean> {
    if (requested !== undefined) return requested;
    const setting = USER_SETTING_TYPES.commissionGalleryPostDefault;
    const value = await this.userSettings.get(
      artistId,
      setting.scope,
      setting.type,
    );
    return value !== 'false';
  }

  async currencyFor(artistId: string): Promise<string> {
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

  private commentImages(dto: { body: string; keys?: string[] }): string[] {
    const images = (dto.keys ?? []).map((key) =>
      this.storage.getPublicUrl(key),
    );
    if (!dto.body.trim() && images.length === 0) {
      throw new BadRequestException('A comment needs text or an image');
    }
    return images;
  }

  private async assertProgressOf(
    commissionId: string,
    progressId: string,
    clientVisibleOnly: boolean,
  ): Promise<void> {
    const progress = await this.db.commissionProgress.findFirst({
      where: {
        id: progressId,
        commissionId,
        ...(clientVisibleOnly ? { visibility: Visibility.CLIENT } : {}),
      },
      select: { id: true },
    });
    if (!progress) {
      throw new NotFoundException(`Progress entry ${progressId} not found`);
    }
  }

  private async withCommentsAndHistory(
    commission: CommissionWithRelations,
  ): Promise<CommissionDetailDto> {
    const [comments, history] = await Promise.all([
      this.db.comment.findMany({
        where: { commissionId: commission.id, progressId: null },
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
      purgeAt:
        (await this.purge.purgeAtFor(commission.id))?.toISOString() ?? null,
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

  private async emailQuote(
    commission: CommissionWithRelations,
    dto: SendQuoteDto,
    accepted: boolean,
  ): Promise<void> {
    const templateId = await this.getTemplateId(
      QUOTE_EMAIL_TEMPLATE_CONFIG_TYPE,
    );
    if (!templateId) return;

    const detail = requireDetail(commission);
    await this.email.sendTemplateEmail({
      to: [{ email: commission.client.email, name: commission.client.name }],
      templateId,
      params: {
        label: commissionDisplayLabel(
          detail.commissionType ?? null,
          commission.client.name,
        ),
        quote: dto.amount,
        currency: detail.currency,
        note: dto.message ?? null,
        accepted,
        accessCode: commission.accessCode,
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
    allowGalleryPost: commission.allowGalleryPost,
    purgedAt: commission.purgedAt?.toISOString() ?? null,
    commissionTypeId: detail.commissionTypeId,
    commissionTypeKey: detail.commissionType?.key ?? null,
    commissionTypeLabel: detail.commissionType?.label ?? null,
    optionKey: detail.optionKey,
    addonKeys: detail.addonKeys,
    currency: detail.currency,
    quote: detail.quote,
    originalQuote: detail.originalQuote,
    estimateLow: detail.estimateLow,
    estimateHigh: detail.estimateHigh,
    quoteSentAt: detail.quoteSentAt?.toISOString() ?? null,
    clientName: commission.client.name,
    clientEmail: commission.client.email,
    preferredContactMethod: commission.client.preferredContactMethod,
    contactHandle: commission.client.contactHandle,
    contactPlatform: detail.contactPlatform,
    contactValue: detail.contactValue,
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
    passcodeSource: commission.passcodeSource,
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
    commissionTypeLabel: detail.commissionType?.label ?? null,
    currency: detail.currency,
    quote: detail.quote,
    referenceAssets: detail.referenceAssets,
    passcodeSource: commission.passcodeSource,
    canSetPasscode: CLIENT_PASSCODE_STATUSES.includes(commission.status),
    isHiddenInQueue: detail.isHiddenInQueue,
    allowGalleryPost: commission.allowGalleryPost,
    contactPlatform: detail.contactPlatform,
    contactValue: detail.contactValue,
    deliveredAt: detail.deliveredAt?.toISOString() ?? null,
    createdAt: commission.createdAt.toISOString(),
    updatedAt: commission.updatedAt.toISOString(),
  };
}

function toPlacement(
  commission: Commission,
  index: number,
  total: number,
): CommissionQueuePlacementDto {
  const stage = QUEUE_STAGE_BY_STATUS[commission.status] ?? 'WAITING';
  return {
    position: index + 1,
    total,
    stage,
    stageIndex: QUEUE_STAGES.indexOf(stage),
    stageCount: QUEUE_STAGES.length,
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

function assertDeadlineFarEnough(deadline: string | undefined): void {
  if (!deadline) return;
  const earliest = new Date();
  earliest.setUTCHours(0, 0, 0, 0);
  earliest.setUTCDate(
    earliest.getUTCDate() +
      COMMISSION_MIN_DEADLINE_DAYS -
      DEADLINE_TIMEZONE_SLACK_DAYS,
  );
  if (new Date(deadline) < earliest) {
    throw new BadRequestException(
      `deadline must be at least ${COMMISSION_MIN_DEADLINE_DAYS} days away`,
    );
  }
}

function submittedContact(dto: SubmitCommissionDto): ContactPoint {
  if (dto.contactPlatform) {
    const contact = {
      platform: dto.contactPlatform,
      value: dto.contactValue?.trim() ?? '',
    };
    if (!isEmailContact(contact) && !contact.value) {
      throw new BadRequestException(
        `contactValue is required for ${dto.contactPlatform}`,
      );
    }
    return contact;
  }
  const method = dto.preferredContactMethod ?? 'EMAIL';
  return {
    platform: platformForContactMethod(method),
    value: method === 'EMAIL' ? '' : (dto.contactHandle?.trim() ?? ''),
  };
}
