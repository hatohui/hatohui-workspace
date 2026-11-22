import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TravelEventVisibility,
  TravelJoinRequestStatus,
  TravelLeaveType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class TravelParticipantMemberDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  handle!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  avatarUrl!: string | null;

  @ApiProperty()
  from!: string;

  @ApiProperty()
  to!: string;

  @ApiProperty({ enum: TravelLeaveType })
  leaveType!: TravelLeaveType;

  @ApiProperty()
  isAlreadyHere!: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  entryFlight!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  exitFlight!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  createdById!: string | null;
}

export class TravelParticipationEventDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  thumbnailUrl!: string | null;

  @ApiProperty()
  startAt!: string;

  @ApiProperty()
  endAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  location!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  mapsUrl!: string | null;

  @ApiProperty({ enum: TravelEventVisibility })
  visibility!: TravelEventVisibility;
}

export class TravelParticipationGroupDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  eventId!: string | null;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  isMemberInviteAllowed!: boolean;

  @ApiProperty()
  isPublic!: boolean;

  @ApiProperty()
  isActivityPublicVisible!: boolean;

  @ApiProperty()
  isMemberListPublicVisible!: boolean;

  @ApiProperty()
  isMediaPublicVisible!: boolean;

  @ApiProperty()
  memberCount!: number;

  @ApiProperty()
  createdAt!: string;
}

export class TravelParticipationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  eventId!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  groupId!: string | null;

  @ApiProperty()
  from!: string;

  @ApiProperty()
  to!: string;

  @ApiProperty({ enum: TravelLeaveType })
  leaveType!: TravelLeaveType;

  @ApiProperty()
  isAlreadyHere!: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  entryFlight!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  exitFlight!: string | null;

  @ApiPropertyOptional({ type: TravelParticipationEventDto, nullable: true })
  event!: TravelParticipationEventDto | null;

  @ApiPropertyOptional({ type: TravelParticipationGroupDto, nullable: true })
  group!: TravelParticipationGroupDto | null;
}

export class TravelParticipationDetailDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  from!: string;

  @ApiProperty()
  to!: string;

  @ApiProperty({ enum: TravelLeaveType })
  leaveType!: TravelLeaveType;

  @ApiProperty()
  isAlreadyHere!: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  entryFlight!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  exitFlight!: string | null;

  @ApiProperty()
  isOwner!: boolean;

  @ApiProperty()
  isMember!: boolean;

  @ApiPropertyOptional({ type: TravelParticipationEventDto, nullable: true })
  event!: TravelParticipationEventDto | null;

  @ApiProperty({ type: TravelParticipationGroupDto })
  group!: TravelParticipationGroupDto;

  @ApiProperty({ type: TravelParticipantMemberDto, isArray: true })
  participants!: TravelParticipantMemberDto[];

  @ApiPropertyOptional({ enum: TravelJoinRequestStatus, nullable: true })
  myJoinRequestStatus!: TravelJoinRequestStatus | null;

  @ApiProperty()
  pendingJoinRequestsCount!: number;
}

export class TravelSharePlanDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  from!: string;

  @ApiProperty()
  to!: string;

  @ApiProperty({ enum: TravelLeaveType })
  leaveType!: TravelLeaveType;

  @ApiProperty()
  groupName!: string;

  @ApiProperty()
  memberCount!: number;

  @ApiProperty()
  sharerName!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  sharerAvatarUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  eventTitle!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  eventDescription!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  eventImageUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  eventLocation!: string | null;
}

export class TravelParticipationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class CreateTravelParticipationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  groupName?: string;

  @ApiProperty()
  @IsDateString()
  from!: string;

  @ApiProperty()
  @IsDateString()
  to!: string;

  @ApiProperty({ enum: TravelLeaveType })
  @IsEnum(TravelLeaveType)
  leaveType!: TravelLeaveType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAlreadyHere?: boolean;

  @ApiPropertyOptional({ maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  entryFlight?: string;

  @ApiPropertyOptional({ maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  exitFlight?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coTravelerIds?: string[];
}

export class UpdateTravelParticipationDatesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: TravelLeaveType })
  @IsOptional()
  @IsEnum(TravelLeaveType)
  leaveType?: TravelLeaveType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAlreadyHere?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  entryFlight?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  exitFlight?: string | null;
}

export class UpdateTravelGroupSettingsDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 120 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMemberInviteAllowed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActivityPublicVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMemberListPublicVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMediaPublicVisible?: boolean;
}

export class InviteTravelMemberDto {
  @ApiProperty()
  @IsString()
  userId!: string;
}

export class AcceptTravelInviteDto {
  @ApiProperty()
  @IsDateString()
  from!: string;

  @ApiProperty()
  @IsDateString()
  to!: string;

  @ApiProperty({ enum: TravelLeaveType })
  @IsEnum(TravelLeaveType)
  leaveType!: TravelLeaveType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAlreadyHere?: boolean;

  @ApiPropertyOptional({ maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  entryFlight?: string;

  @ApiPropertyOptional({ maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  exitFlight?: string;
}

export class KickTravelMemberDto {
  @ApiProperty()
  @IsString()
  userId!: string;
}

export class TransferTravelOwnershipDto {
  @ApiProperty()
  @IsString()
  newOwnerId!: string;
}

export class TravelJoinRequestDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  groupId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  handle!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ enum: TravelJoinRequestStatus })
  status!: TravelJoinRequestStatus;

  @ApiProperty()
  createdAt!: string;
}

export class TravelAdminGroupsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;
}

export class TravelAdminGroupItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty()
  isPublic!: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  eventTitle!: string | null;

  @ApiProperty()
  memberCount!: number;

  @ApiProperty()
  activityCount!: number;

  @ApiProperty()
  imageCount!: number;

  @ApiProperty()
  createdAt!: string;
}

export class TravelAdminGroupsResponseDto {
  @ApiProperty()
  total!: number;

  @ApiProperty({ type: TravelAdminGroupItemDto, isArray: true })
  groups!: TravelAdminGroupItemDto[];
}

export class TravelAdminStatsDto {
  @ApiProperty()
  totalEvents!: number;

  @ApiProperty()
  pendingEvents!: number;

  @ApiProperty()
  totalGroups!: number;

  @ApiProperty()
  totalParticipations!: number;

  @ApiProperty()
  totalJobProfiles!: number;
}
