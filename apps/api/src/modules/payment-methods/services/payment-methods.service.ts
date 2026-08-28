import { Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import { PaymentMethodDto } from '@/modules/payment-methods/dto/payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly db: Database) {}

  async list(): Promise<PaymentMethodDto[]> {
    const rows = await this.db.paymentMethod.findMany({
      where: { active: true },
      orderBy: { no: 'asc' },
    });
    return rows.map((row) => ({ key: row.key, name: row.name }));
  }

  async keysExist(keys: string[]): Promise<Set<string>> {
    if (keys.length === 0) return new Set();
    const rows = await this.db.paymentMethod.findMany({
      where: { key: { in: keys }, active: true },
      select: { key: true },
    });
    return new Set(rows.map((row) => row.key));
  }
}
