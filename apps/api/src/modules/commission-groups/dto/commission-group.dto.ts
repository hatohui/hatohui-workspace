import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CommentDto } from '@/modules/commissions/dto/comment.dto';

export class CommissionGroupMemberDto {
  @ApiProperty()
  clientId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

/** A member's piece within a group view — deliberately thin (not the full
 * admin CommissionDto). Price isn't repeated here: a group has one shared
 * `quote`/`currency` (on CommissionGroupDto itself), not one per member. */
export class CommissionGroupCommissionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;
}

export class CommissionGroupDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true, type: String })
  description: string | null;

  @ApiProperty({ nullable: true, type: String })
  projectId: string | null;

  @ApiProperty({
    description:
      "The group's shared-view access code — treat it like a password, per the anonymous-access model",
  })
  accessCode: string;

  @ApiProperty()
  currency: string;

  @ApiProperty({ nullable: true })
  quote: number | null;

  @ApiProperty({ type: CommissionGroupMemberDto, isArray: true })
  members: CommissionGroupMemberDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

/** Everything a member is allowed to see about their group — including every
 * member's commission and quote, per the PRD's "visibility inside a group is
 * total" rule. */
export class CommissionGroupViewDto extends CommissionGroupDto {
  @ApiProperty({ type: CommissionGroupCommissionDto, isArray: true })
  commissions: CommissionGroupCommissionDto[];

  @ApiProperty({ type: CommentDto, isArray: true })
  comments: CommentDto[];
}

export class CreateCommissionGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectId?: string;
}

export class UpdateCommissionGroupDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  quote?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class AddCommissionGroupMemberDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: false,
    description: 'Required only if this email has no Client row yet',
  })
  @IsOptional()
  @IsString()
  name?: string;
}

export class PostCommissionGroupCommentDto {
  @ApiProperty({
    description:
      "The access code of the member's own commission — proves membership",
  })
  @IsString()
  @IsNotEmpty()
  memberAccessCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;
}
