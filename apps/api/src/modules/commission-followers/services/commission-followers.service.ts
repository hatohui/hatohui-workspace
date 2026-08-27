import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import type { CommissionFollower } from '@prisma/client';
import { CommissionFollowerDto } from '@/modules/commission-followers/dto/commission-follower.dto';

@Injectable()
export class CommissionFollowersService {
  constructor(private readonly db: Database) {}

  async subscribe(artistId: string, email: string): Promise<void> {
    await this.db.commissionFollower.upsert({
      where: { artistId_email: { artistId, email } },
      update: { isActive: true },
      create: { artistId, email },
    });
  }

  async unsubscribe(token: string): Promise<void> {
    const row = await this.db.commissionFollower.findUnique({
      where: { unsubscribeToken: token },
    });
    if (!row) {
      throw new NotFoundException('Unknown unsubscribe link');
    }
    await this.db.commissionFollower.update({
      where: { id: row.id },
      data: { isActive: false },
    });
  }

  listMine(artistId: string): Promise<CommissionFollowerDto[]> {
    return this.db.commissionFollower
      .findMany({
        where: { artistId, isActive: true },
        orderBy: { createdAt: 'desc' },
      })
      .then((rows) => rows.map(toDto));
  }
}

function toDto(row: CommissionFollower): CommissionFollowerDto {
  return {
    id: row.id,
    email: row.email,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}
