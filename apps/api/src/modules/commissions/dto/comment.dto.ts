import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { COMMENT_IMAGE_LIMIT } from '@/modules/commissions/commissions.constants';
import { Visibility } from '@prisma/client';

export { Visibility };

export class CommentDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ nullable: true })
  commissionId: string | null;

  @ApiProperty({ nullable: true })
  progressId: string | null;

  @ApiProperty({ nullable: true })
  groupId: string | null;

  @ApiProperty({ nullable: true })
  projectId: string | null;

  @ApiProperty({
    example: 'clx1234567890',
    nullable: true,
    description: 'Set only when authorRole is CLIENT',
  })
  authorClientId: string | null;

  @ApiProperty({
    enum: ['ARTIST', 'CLIENT'],
    description: 'Who wrote the comment',
  })
  authorRole: 'ARTIST' | 'CLIENT';

  @ApiProperty({ enum: Visibility })
  visibility: Visibility;

  @ApiProperty({ example: 'Client confirmed the pose reference.' })
  body: string;

  @ApiProperty({
    nullable: true,
    type: String,
    description:
      'When the other party saw it; always null on client-authored comments in client-facing responses',
  })
  seenAt: string | null;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;
}

export class CreateCommentDto {
  @ApiProperty({
    example: 'Client confirmed the pose reference.',
    description: 'May be empty when images are attached',
  })
  @IsString()
  body: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Storage keys of images uploaded with this comment',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(COMMENT_IMAGE_LIMIT)
  @IsString({ each: true })
  keys?: string[];

  @ApiProperty({
    enum: Visibility,
    default: Visibility.INTERNAL,
  })
  @IsEnum(Visibility)
  visibility: Visibility;

  @ApiProperty({
    required: false,
    description: 'Progress update this comments on; omit for a general note',
  })
  @IsOptional()
  @IsString()
  progressId?: string;
}

interface CommentSource {
  id: string;
  commissionId: string | null;
  progressId: string | null;
  groupId: string | null;
  projectId: string | null;
  authorClientId: string | null;
  authorRole: CommentDto['authorRole'];
  visibility: Visibility;
  body: string;
  seenAt: Date | null;
  images: string[];
  createdAt: Date;
}

export function toCommentDto(comment: CommentSource): CommentDto {
  return {
    id: comment.id,
    commissionId: comment.commissionId,
    progressId: comment.progressId,
    groupId: comment.groupId,
    projectId: comment.projectId,
    authorClientId: comment.authorClientId,
    authorRole: comment.authorRole,
    visibility: comment.visibility,
    body: comment.body,
    seenAt: comment.seenAt?.toISOString() ?? null,
    images: comment.images,
    createdAt: comment.createdAt.toISOString(),
  };
}

export function toClientCommentDto(comment: CommentSource): CommentDto {
  const dto = toCommentDto(comment);
  return comment.authorRole === 'CLIENT' ? { ...dto, seenAt: null } : dto;
}
