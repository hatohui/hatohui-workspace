import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import { ClientPrefillDto } from '@/modules/clients/dto/client.dto';
import { ClientDetailDto } from '@/modules/clients/dto/client-detail.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly db: Database) {}

  async lookupByEmail(email: string): Promise<ClientPrefillDto | null> {
    const client = await this.db.client.findUnique({ where: { email } });
    if (!client) return null;
    return {
      name: client.name,
      preferredContactMethod: client.preferredContactMethod,
      contactHandle: client.contactHandle,
    };
  }

  async detailForArtist(
    artistId: string,
    clientId: string,
  ): Promise<ClientDetailDto> {
    const client = await this.db.client.findFirst({
      where: { id: clientId, commissions: { some: { artistId } } },
      include: {
        user: { include: { profile: true } },
        commissions: {
          where: { artistId },
          orderBy: { createdAt: 'desc' },
          include: { detail: { include: { commissionType: true } } },
        },
      },
    });
    if (!client) throw new NotFoundException('Client not found');

    const { user } = client;
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      preferredContactMethod: client.preferredContactMethod,
      contactHandle: client.contactHandle,
      account: user
        ? {
            userId: user.id,
            name: user.profile?.displayName ?? user.name,
            handle: user.profile?.handle ?? null,
            avatarUrl: user.profile?.avatarUrl ?? user.avatarUrl,
          }
        : null,
      commissions: client.commissions.map((commission) => ({
        id: commission.id,
        status: commission.status,
        commissionTypeKey: commission.detail?.commissionType?.key ?? null,
        commissionTypeLabel: commission.detail?.commissionType?.label ?? null,
        quote: commission.detail?.quote ?? null,
        currency: commission.detail?.currency ?? '',
        createdAt: commission.createdAt.toISOString(),
      })),
    };
  }
}
