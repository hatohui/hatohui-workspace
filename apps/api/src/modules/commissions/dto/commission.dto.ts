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
    example: CommissionStatus.NOT_YET_STARTED,
  })
  status: CommissionStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.NOT_YET })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Whether this commission is hidden from any public showcase',
  })
  isHidden: boolean;

  @ApiProperty({ nullable: true })
  commissionTypeId: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Also the i18n key: commission.type.<key>',
  })
  commissionTypeKey: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Key of the selected CommissionOptionPricing',
  })
  optionKey: string | null;

  @ApiProperty({
    type: [String],
    description: 'Keys of selected CommissionAddonPricing rows',
  })
  addonKeys: string[];

  @ApiProperty({ nullable: true, description: 'Quote in USD cents' })
  quoteCents: number | null;

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

  @ApiProperty({ type: [String] })
  deliverableAssets: string[];

  @ApiProperty({ nullable: true })
  deliveredAt: string | null;

  @ApiProperty({ type: CommissionStepsDto })
  steps: CommissionStepsDto;

  @ApiProperty({ nullable: true })
  assignedToId: string | null;

  @ApiProperty({ nullable: true })
  projectId: string | null;

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
    example: CommissionStatus.NOT_YET_STARTED,
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

  @ApiProperty({ nullable: true })
  quoteCents: number | null;

  @ApiProperty({ type: [String] })
  referenceAssets: string[];

  @ApiProperty({ type: [String] })
  deliverableAssets: string[];

  @ApiProperty({ nullable: true })
  deliveredAt: string | null;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  updatedAt: string;
}

export class SubmitCommissionDto {
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
    description: 'Key of a CommissionOptionPricing',
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
    description: 'Final quote in USD cents',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  quoteCents?: number | null;
}

export class UpdateCommissionVisibilityDto {
  @ApiProperty()
  @IsBoolean()
  isHidden: boolean;
}

export class UpdateCommissionProjectDto {
  @ApiProperty({
    nullable: true,
    description: 'Project id to attach, or null to detach',
  })
  @IsOptional()
  @IsString()
  projectId?: string | null;
}

export class DeliverCommissionDto {
  @ApiProperty({
    type: [String],
    description:
      'Object keys of the final artwork, returned by POST /images/sign',
  })
  @IsArray()
  @IsString({ each: true })
  deliverableAssets: string[];
}

export class AssignCommissionDto {
  @ApiProperty({
    nullable: true,
    required: false,
    description: 'User id to assign, or null to unassign',
  })
  @IsOptional()
  @IsString()
  assignedToId?: string | null;
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
