import { Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import { ClientPrefillDto } from '@/modules/clients/dto/client.dto';

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
}
