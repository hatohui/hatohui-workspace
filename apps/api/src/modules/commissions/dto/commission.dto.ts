import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  CommissionStatus,
  PaymentStatus,
  PreferredContactMethod,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';
import {
  COMMISSION_STEP_KEYS,
  type CommissionStepKey,
} from '@/modules/commissions/commissions.constants';
import { IsTiptapDocument } from '@/common/validators/tiptap-document.validator';

export { CommissionStatus, PaymentStatus, PreferredContactMethod };

export class CommissionStepsDto {
  @ApiProperty({ nullable: true })
  ideaConfirmedAt: string | null;

  @ApiProperty({ nullable: true })
  sketchConfirmedAt: string | null;

  @ApiProperty({ nullable: true })
  paymentConfirmedAt: string | null;

  @ApiProperty({ nullable: true })
  lineDoneAt: string | null;

  @ApiProperty({ nullable: true })
  coloringDoneAt: string | null;

  @ApiProperty({ nullable: true })
  finishedAt: string | null;
}

export class CommissionDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty({ nullable: true })
  commissionOpeningId: string | null;

  @ApiProperty({ nullable: true })
  groupId: string | null;

  @ApiProperty({ nullable: true })
  paymentMethodId: string | null;

  @ApiProperty({
    enum: CommissionStatus,
    example: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @ApiProperty({ nullable: true, description: 'Custom triage ordering' })
  priority: number | null;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Tiptap/ProseMirror JSON document',
  })
  idea: Prisma.JsonValue;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z', nullable: true })
  deadline: string | null;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.NOT_YET })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Whether this commission is hidden from the public /queue',
  })
  isHiddenInQueue: boolean;

  @ApiProperty({ nullable: true })
  commissionTypeId: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Also the i18n key: commission.type.<key>',
  })
  commissionTypeKey: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Key of the selected CommissionOption',
  })
  optionKey: string | null;

  @ApiProperty({
    type: [String],
    description: 'Keys of selected CommissionAddon rows',
  })
  addonKeys: string[];

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({
    nullable: true,
    description: "Quote, in currency's smallest unit",
  })
  quote: number | null;

  @ApiProperty({
    nullable: true,
    description: 'Quote snapshotted at accept time, to detect later changes',
  })
  originalQuote: number | null;

  @ApiProperty({ example: 'Jane Doe' })
  clientName: string;

  @ApiProperty({ example: 'jane@example.com' })
  clientEmail: string;

  @ApiProperty({ enum: PreferredContactMethod })
  preferredContactMethod: PreferredContactMethod;

  @ApiProperty({ nullable: true })
  contactHandle: string | null;

  @ApiProperty({ type: [String] })
  referenceAssets: string[];

  @ApiProperty({ nullable: true })
  deliveredAt: string | null;

  @ApiProperty({ type: CommissionStepsDto })
  steps: CommissionStepsDto;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  updatedAt: string;
}

export class CommissionPublicDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({
    description: 'Private code used to view/manage this commission',
  })
  accessCode: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Tiptap/ProseMirror JSON document',
  })
  idea: Prisma.JsonValue;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z', nullable: true })
  deadline: string | null;

  @ApiProperty({
    enum: CommissionStatus,
    example: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.NOT_YET })
  paymentStatus: PaymentStatus;

  @ApiProperty({ nullable: true })
  commissionTypeId: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Also the i18n key: commission.type.<key>',
  })
  commissionTypeKey: string | null;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ nullable: true })
  quote: number | null;

  @ApiProperty({ type: [String] })
  referenceAssets: string[];

  @ApiProperty({ nullable: true })
  deliveredAt: string | null;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  updatedAt: string;
}

export class SubmitCommissionDto {
  @ApiProperty({ description: 'Id of the artist being commissioned' })
  @IsString()
  @IsNotEmpty()
  artistId: string;

  @ApiProperty({
    required: false,
    description:
      'Id of the CommissionOpening this is submitted through, if any',
  })
  @IsOptional()
  @IsString()
  commissionOpeningId?: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Tiptap/ProseMirror JSON document describing the idea',
  })
  @IsTiptapDocument()
  idea: Prisma.InputJsonValue;

  @ApiProperty({ example: '2026-09-01', required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({
    required: false,
    description: 'Id of a CommissionType',
  })
  @IsOptional()
  @IsString()
  commissionTypeId?: string;

  @ApiProperty({
    required: false,
    description: 'Key of a CommissionOption',
  })
  @IsOptional()
  @IsString()
  optionKey?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonKeys?: string[];

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  clientEmail: string;

  @ApiProperty({
    enum: PreferredContactMethod,
    default: PreferredContactMethod.EMAIL,
    required: false,
  })
  @IsOptional()
  @IsEnum(PreferredContactMethod)
  preferredContactMethod?: PreferredContactMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactHandle?: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Object keys returned by POST /images/sign',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceAssets?: string[];

  @ApiProperty({
    default: false,
    required: false,
    description:
      'Whether this commission (status, type) should show in the public /queue',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CreatePrivateCommissionDto extends SubmitCommissionDto {}

export class UpdateCommissionStatusDto {
  @ApiProperty({ enum: CommissionStatus })
  @IsEnum(CommissionStatus)
  status: CommissionStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}

export class UpdateCommissionPriorityDto {
  @ApiProperty({
    description:
      'Custom triage ordering — lower sorts first. Null clears it back to first-come-first-serve.',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  priority: number | null;
}

export class SendConfirmationEmailDto {
  @ApiProperty({
    required: false,
    description:
      'Required if the quote changed since this commission was accepted — explains why to the client',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  note?: string;
}

export class UpdateCommissionStepDto {
  @ApiProperty({ enum: COMMISSION_STEP_KEYS })
  @IsEnum(COMMISSION_STEP_KEYS)
  step: CommissionStepKey;

  @ApiProperty({
    description: 'Whether the step is done (sets/clears its timestamp)',
  })
  @IsBoolean()
  done: boolean;
}

export class UpdateCommissionQuoteDto {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  commissionTypeId?: string | null;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  optionKey?: string | null;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonKeys?: string[];

  @ApiProperty({
    nullable: true,
    required: false,
    description: "Quote, in currency's smallest unit",
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  quote?: number | null;
}

export class UpdateCommissionVisibilityDto {
  @ApiProperty()
  @IsBoolean()
  isHiddenInQueue: boolean;
}

export class DeliverCommissionDto {
  @ApiProperty({
    type: [String],
    description:
      'Object keys of the final artwork, returned by POST /images/sign',
  })
  @IsArray()
  @IsString({ each: true })
  images: string[];
}

export class AddReferenceAssetsDto {
  @ApiProperty({
    type: [String],
    required: false,
    description: 'Object keys returned by POST /images/sign',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keys?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description:
      'Raw external links (e.g. a Google Drive reference sheet) — stored as-is, not validated as images',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  urls?: string[];
}
