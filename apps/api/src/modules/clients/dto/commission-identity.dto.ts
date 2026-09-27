import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ContactPointDto {
  @ApiProperty({
    example: 'Discord',
    description:
      "A SocialPlatform name (how Profile.socialMedias keys it), or 'email'",
  })
  platform: string;

  @ApiProperty({ example: 'luke#1234' })
  value: string;
}

export class CommissionIdentityDto {
  @ApiProperty()
  profileId: string;

  @ApiProperty({ example: 'Luke' })
  displayName: string;

  @ApiProperty({ nullable: true, type: String, example: 'luke' })
  handle: string | null;

  @ApiProperty({ nullable: true, type: String })
  avatarUrl: string | null;

  @ApiProperty({ type: ContactPointDto, isArray: true })
  contacts: ContactPointDto[];
}

export class MatchCommissionIdentityDto {
  @ApiProperty({ required: false, example: 'Luke' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: 'luke' })
  @IsOptional()
  @IsString()
  handle?: string;

  @ApiProperty({ required: false, example: 'luke@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class MyCommissionIdentityDto {
  @ApiProperty({ example: 'luke@example.com' })
  email: string;

  @ApiProperty({
    type: CommissionIdentityDto,
    nullable: true,
    description: 'Null when the account has no public profile',
  })
  identity: CommissionIdentityDto | null;
}
