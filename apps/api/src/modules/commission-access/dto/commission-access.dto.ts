import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CommissionStatus, PasscodeSource } from '@prisma/client';
import {
  PASSCODE_MAX_LENGTH,
  PASSCODE_MIN_LENGTH,
} from '@/modules/commission-access/commission-access.constants';

export class UnlockCommissionDto {
  @ApiProperty({ description: 'Queue item id the client clicked' })
  @IsString()
  commissionId: string;

  @ApiProperty({ example: 'K7QM2PXA' })
  @IsString()
  @MaxLength(PASSCODE_MAX_LENGTH)
  passcode: string;
}

export class UnlockedCommissionDto {
  @ApiProperty({ description: 'Private code for the order page' })
  accessCode: string;
}

export class PasscodeLookupDto {
  @ApiProperty({ description: 'Artist whose queue is being searched' })
  @IsString()
  artistId: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'K7QM2PXA' })
  @IsString()
  @MaxLength(PASSCODE_MAX_LENGTH)
  passcode: string;
}

export class CommissionAccessMatchDto {
  @ApiProperty()
  accessCode: string;

  @ApiProperty({ enum: CommissionStatus })
  status: CommissionStatus;

  @ApiProperty({ nullable: true, type: String })
  commissionTypeKey: string | null;

  @ApiProperty({ nullable: true, type: String })
  commissionTypeLabel: string | null;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;
}

export class SetArtistPasscodeDto {
  @ApiProperty({
    required: false,
    description: 'Custom passcode; omit to generate one',
  })
  @IsOptional()
  @IsString()
  @MinLength(PASSCODE_MIN_LENGTH)
  @MaxLength(PASSCODE_MAX_LENGTH)
  passcode?: string;
}

export class SetClientPasscodeDto {
  @ApiProperty({ example: 'my-secret-fox' })
  @IsString()
  @MinLength(PASSCODE_MIN_LENGTH)
  @MaxLength(PASSCODE_MAX_LENGTH)
  passcode: string;
}

export class CommissionPasscodeDto {
  @ApiProperty({ enum: PasscodeSource, nullable: true })
  source: PasscodeSource | null;

  @ApiProperty({ nullable: true, type: String })
  updatedAt: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Plain passcode, returned only in the response that set it',
  })
  passcode: string | null;
}
