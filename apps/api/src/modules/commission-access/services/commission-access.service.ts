import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PasscodeSource, type Commission } from '@prisma/client';
import { Database } from '@/infra/db';
import {
  generatePasscode,
  hashPasscode,
  verifyPasscode,
} from '@/common/utils/passcode';
import { QUEUE_STATUSES } from '@/modules/commissions/commissions.constants';
import {
  CommissionAccessMatchDto,
  CommissionPasscodeDto,
  PasscodeLookupDto,
  UnlockCommissionDto,
  UnlockedCommissionDto,
} from '@/modules/commission-access/dto/commission-access.dto';
import { WRONG_PASSCODE_MESSAGE } from '@/modules/commission-access/commission-access.constants';

@Injectable()
export class CommissionAccessService {
  constructor(private readonly db: Database) {}

  async unlock(dto: UnlockCommissionDto): Promise<UnlockedCommissionDto> {
    const commission = await this.db.commission.findFirst({
      where: {
        id: dto.commissionId,
        status: { in: QUEUE_STATUSES },
        detail: { isHiddenInQueue: false },
      },
    });
    if (!commission || !(await this.matches(commission, dto.passcode))) {
      throw new ForbiddenException(WRONG_PASSCODE_MESSAGE);
    }
    return { accessCode: commission.accessCode };
  }

  async lookup(dto: PasscodeLookupDto): Promise<CommissionAccessMatchDto[]> {
    const commissions = await this.db.commission.findMany({
      where: {
        artistId: dto.artistId,
        client: { email: { equals: dto.email.trim(), mode: 'insensitive' } },
        passcodeHash: { not: null },
      },
      include: { detail: { include: { commissionType: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const verified = await Promise.all(
      commissions.map((commission) => this.matches(commission, dto.passcode)),
    );
    const matches = commissions.filter((_, index) => verified[index]);
    if (matches.length === 0) {
      throw new ForbiddenException(WRONG_PASSCODE_MESSAGE);
    }

    return matches.map((commission) => ({
      accessCode: commission.accessCode,
      status: commission.status,
      commissionTypeKey: commission.detail?.commissionType?.key ?? null,
      commissionTypeLabel: commission.detail?.commissionType?.label ?? null,
      createdAt: commission.createdAt.toISOString(),
    }));
  }

  async getForArtist(
    artistId: string,
    commissionId: string,
  ): Promise<CommissionPasscodeDto> {
    const commission = await this.findOwnedOrThrow(artistId, commissionId);
    return toPasscodeDto(commission, null);
  }

  async setByArtist(
    artistId: string,
    commissionId: string,
    passcode: string | undefined,
  ): Promise<CommissionPasscodeDto> {
    await this.findOwnedOrThrow(artistId, commissionId);
    const source = passcode ? PasscodeSource.ARTIST : PasscodeSource.GENERATED;
    const plain = passcode ?? generatePasscode();
    const commission = await this.store({ id: commissionId }, plain, source);
    return toPasscodeDto(commission, plain);
  }

  async clearByArtist(
    artistId: string,
    commissionId: string,
  ): Promise<CommissionPasscodeDto> {
    await this.findOwnedOrThrow(artistId, commissionId);
    const commission = await this.db.commission.update({
      where: { id: commissionId },
      data: {
        passcodeHash: null,
        passcodeSource: null,
        passcodeUpdatedAt: new Date(),
      },
    });
    return toPasscodeDto(commission, null);
  }

  async setByClient(
    accessCode: string,
    passcode: string,
  ): Promise<CommissionPasscodeDto> {
    const existing = await this.db.commission.findUnique({
      where: { accessCode },
    });
    if (!existing) throw new NotFoundException('Commission not found');
    const commission = await this.store(
      { accessCode },
      passcode,
      PasscodeSource.CLIENT,
    );
    return toPasscodeDto(commission, null);
  }

  private async store(
    where: { id: string } | { accessCode: string },
    passcode: string,
    source: PasscodeSource,
  ): Promise<Commission> {
    return this.db.commission.update({
      where,
      data: {
        passcodeHash: await hashPasscode(passcode, source),
        passcodeSource: source,
        passcodeUpdatedAt: new Date(),
      },
    });
  }

  private async matches(
    commission: Commission,
    passcode: string,
  ): Promise<boolean> {
    if (!commission.passcodeHash || !commission.passcodeSource) return false;
    return verifyPasscode(
      passcode,
      commission.passcodeSource,
      commission.passcodeHash,
    );
  }

  private async findOwnedOrThrow(
    artistId: string,
    commissionId: string,
  ): Promise<Commission> {
    const commission = await this.db.commission.findUnique({
      where: { id: commissionId },
    });
    if (!commission || commission.artistId !== artistId) {
      throw new NotFoundException(`Commission ${commissionId} not found`);
    }
    return commission;
  }
}

function toPasscodeDto(
  commission: Commission,
  plain: string | null,
): CommissionPasscodeDto {
  return {
    source: commission.passcodeSource,
    updatedAt: commission.passcodeUpdatedAt?.toISOString() ?? null,
    passcode: plain,
  };
}
