import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { ImagesService } from '@/modules/images/services/images.service';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';
import { ProcessType } from '@/modules/process-queue/process-queue.constants';
import {
  SignImageDto,
  SignedImageDto,
} from '@/modules/images/dto/sign-image.dto';
import {
  ATTACHMENT_CLAIM_WINDOW_HOURS,
  MARKDOWN_IMAGE_URL_PATTERN,
} from '@/modules/commission-attachments/commission-attachments.constants';

@Injectable()
export class CommissionAttachmentsService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly images: ImagesService,
    private readonly processQueue: ProcessQueueService,
    private readonly storageCleanup: StorageCleanupService,
  ) {}

  async signForClient(
    code: string,
    dto: SignImageDto,
  ): Promise<SignedImageDto> {
    const commission = await this.db.commission.findUnique({
      where: { accessCode: code },
      select: { client: { select: { name: true } } },
    });
    if (!commission) throw new NotFoundException('Commission not found');
    const signed = await this.images.sign(
      { ...dto, uploaderName: commission.client.name },
      null,
    );
    await this.scheduleCleanup(signed.key);
    return signed;
  }

  async signForArtist(
    artistId: string,
    commissionId: string,
    dto: SignImageDto,
  ): Promise<SignedImageDto> {
    const commission = await this.db.commission.findUnique({
      where: { id: commissionId },
      select: { artistId: true },
    });
    if (!commission || commission.artistId !== artistId) {
      throw new NotFoundException(`Commission ${commissionId} not found`);
    }
    const signed = await this.images.sign(dto, artistId);
    await this.scheduleCleanup(signed.key);
    return signed;
  }

  async claim(keys: string[], markdown?: string | null): Promise<void> {
    await Promise.all(
      [...new Set([...keys, ...this.inlineKeys([markdown])])].map((key) =>
        this.processQueue.clearForRef(ProcessType.STORAGE_DELETE, key),
      ),
    );
  }

  /// Queues the deletes as part of the caller's transaction, so a crash after
  /// the rows are gone can't orphan the files; release() then runs them eagerly.
  queueDeletes(
    urls: string[],
    markdown: (string | null)[],
    keep: string[] = [],
  ) {
    const kept = new Set(
      keep
        .map((url) => this.storage.getKeyFromUrl(url))
        .filter((key): key is string => key !== null),
    );
    const keys = new Set([
      ...urls
        .map((url) => this.storage.getKeyFromUrl(url))
        .filter((key): key is string => key !== null),
      ...this.inlineKeys(markdown),
    ]);
    return this.db.processQueue.createMany({
      data: [...keys]
        .filter((key) => !kept.has(key))
        .map((key) => ({ type: ProcessType.STORAGE_DELETE, refId: key })),
      skipDuplicates: true,
    });
  }

  /// Call after the owning rows are deleted, so they no longer count as references.
  async release(urls: string[], markdown: (string | null)[]): Promise<void> {
    const keys = new Set([
      ...urls
        .map((url) => this.storage.getKeyFromUrl(url))
        .filter((key): key is string => key !== null),
      ...this.inlineKeys(markdown),
    ]);
    for (const key of keys) {
      if (await this.isStillReferenced(key)) continue;
      await this.processQueue.clearForRef(ProcessType.STORAGE_DELETE, key);
      await this.storageCleanup.delete(key);
    }
  }

  private inlineKeys(markdown: (string | null | undefined)[]): string[] {
    return markdown
      .flatMap((text) => [...(text ?? '').matchAll(MARKDOWN_IMAGE_URL_PATTERN)])
      .map((match) => this.storage.getKeyFromUrl(match[1]))
      .filter((key): key is string => key !== null);
  }

  private async isStillReferenced(key: string): Promise<boolean> {
    const url = this.storage.getPublicUrl(key);
    const [asset, comment, progress, detail] = await Promise.all([
      this.db.asset.findFirst({
        where: { OR: [{ key }, { publicUrl: url }] },
        select: { id: true },
      }),
      this.db.comment.findFirst({
        where: { OR: [{ images: { has: url } }, { body: { contains: url } }] },
        select: { id: true },
      }),
      this.db.commissionProgress.findFirst({
        where: {
          OR: [{ images: { has: url } }, { description: { contains: url } }],
        },
        select: { id: true },
      }),
      this.db.commissionDetail.findFirst({
        where: { referenceAssets: { has: url } },
        select: { commissionId: true },
      }),
    ]);
    return Boolean(asset || comment || progress || detail);
  }

  private scheduleCleanup(key: string): Promise<void> {
    return this.processQueue.schedule(
      ProcessType.STORAGE_DELETE,
      key,
      new Date(Date.now() + ATTACHMENT_CLAIM_WINDOW_HOURS * 3_600_000),
    );
  }
}
