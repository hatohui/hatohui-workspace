import { Injectable, NotFoundException } from '@nestjs/common';
import { Database, type PrismaTransactionClient } from '@/libs/db';
import type { AvatarVersion } from '@prisma/client';
import { AvatarVersionDto } from './dto/avatar-version.dto';

@Injectable()
export class AvatarsService {
  constructor(private readonly db: Database) {}

  async listVersions(ownerId: string): Promise<AvatarVersionDto[]> {
    const versions = await this.db.avatarVersion.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
    return versions.map(toAvatarVersionDto);
  }

  /// Archives the owner's currently-active avatar as a version. Call this
  /// inside the caller's own transaction, right before overwriting the
  /// owner's live avatarKey/avatarUrl fields.
  archiveCurrent(
    tx: PrismaTransactionClient,
    ownerId: string,
    key: string,
    url: string,
  ): Promise<AvatarVersion> {
    return tx.avatarVersion.create({
      data: { ownerId, key, url },
    });
  }

  /// Removes a version from history so the caller can promote it back to
  /// being the owner's live avatar, inside the caller's own transaction.
  /// Throws if the version doesn't belong to this owner.
  async takeVersion(
    tx: PrismaTransactionClient,
    ownerId: string,
    versionId: string,
  ): Promise<{ key: string; url: string }> {
    const version = await tx.avatarVersion.findUnique({
      where: { id: versionId },
    });
    if (!version || version.ownerId !== ownerId) {
      throw new NotFoundException(`Avatar version ${versionId} not found`);
    }
    await tx.avatarVersion.delete({ where: { id: versionId } });
    return { key: version.key, url: version.url };
  }
}

function toAvatarVersionDto(version: AvatarVersion): AvatarVersionDto {
  return {
    id: version.id,
    url: version.url,
    createdAt: version.createdAt.toISOString(),
  };
}
