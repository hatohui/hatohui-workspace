import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CommissionStatus, ProcessType } from '@prisma/client';
import { Database } from '@/infra/db';
import type { ProcessExecutor } from '@/modules/process-queue/process-queue.constants';
import { AssetsService } from '@/modules/assets/services/assets.service';
import { CommissionAttachmentsService } from '@/modules/commission-attachments/services/commission-attachments.service';

@Injectable()
export class CommissionPurgeExecutor implements ProcessExecutor {
  readonly type = ProcessType.COMMISSION_PURGE;

  constructor(
    private readonly db: Database,
    private readonly assets: AssetsService,
    private readonly attachments: CommissionAttachmentsService,
  ) {}

  async execute(commissionId: string): Promise<void> {
    const commission = await this.db.commission.findUnique({
      where: { id: commissionId },
      include: {
        artist: true,
        detail: { include: { commissionType: { include: { tag: true } } } },
        progress: true,
        comments: true,
      },
    });
    if (!commission || commission.purgedAt) return;
    if (commission.status !== CommissionStatus.COMPLETED) return;

    const finalImages = [
      ...new Set(
        commission.progress.filter((p) => p.isFinal).flatMap((p) => p.images),
      ),
    ];
    const tagNames = [
      commission.detail?.commissionType?.tag?.name,
      commission.detail?.optionKey,
      ...(commission.detail?.addonKeys ?? []),
    ].filter((name): name is string => Boolean(name));

    for (const url of finalImages) {
      const assetId = await this.assets.ensureForUrl(url, commission.artist);
      await this.db.asset.update({
        where: { id: assetId },
        data: {
          commissionId,
          ...(commission.allowGalleryPost ? {} : { isPrivate: true }),
        },
      });
      await this.tag(assetId, tagNames);
    }

    const discarded = {
      images: [
        ...commission.progress.flatMap((p) => p.images),
        ...commission.comments.flatMap((c) => c.images),
      ],
      markdown: [
        ...commission.progress.map((p) => p.description),
        ...commission.comments.map((c) => c.body),
      ],
    };

    await this.db.$transaction([
      this.attachments.queueDeletes(
        discarded.images,
        discarded.markdown,
        finalImages,
      ),
      this.db.comment.deleteMany({
        where: { OR: [{ commissionId }, { progress: { commissionId } }] },
      }),
      this.db.commissionProgress.deleteMany({ where: { commissionId } }),
      this.db.commissionStatusHistory.updateMany({
        where: { commissionId },
        data: { note: null },
      }),
      this.db.commissionDetail.updateMany({
        where: { commissionId },
        data: {
          idea: {},
          deadline: null,
          isHiddenInQueue: true,
          estimateLow: null,
          estimateHigh: null,
          originalQuote: null,
          quoteSentAt: null,
          contactPlatform: null,
          contactValue: null,
          deliveredAt: null,
          ideaConfirmedAt: null,
          sketchConfirmedAt: null,
          paymentConfirmedAt: null,
          lineDoneAt: null,
          coloringDoneAt: null,
          finishedAt: null,
        },
      }),
      this.db.commission.update({
        where: { id: commissionId },
        data: {
          purgedAt: new Date(),
          accessCode: randomUUID(),
          passcodeHash: null,
          passcodeSource: null,
          passcodeUpdatedAt: null,
          priority: null,
        },
      }),
    ]);

    await this.attachments.release(discarded.images, discarded.markdown);
  }

  private async tag(assetId: string, names: string[]): Promise<void> {
    if (names.length === 0) return;
    const tags = await Promise.all(
      [...new Set(names)].map((name) =>
        this.db.tag.upsert({ where: { name }, create: { name }, update: {} }),
      ),
    );
    await this.db.assetTag.createMany({
      data: tags.map((tag) => ({ assetId, tagId: tag.id })),
      skipDuplicates: true,
    });
  }
}
