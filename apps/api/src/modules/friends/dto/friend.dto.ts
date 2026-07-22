import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FriendDto {
  @ApiProperty({ example: 'clx1234567890', description: 'Unique friend id' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 1998, nullable: true, description: 'Birth year' })
  birthYear: number | null;

  @ApiProperty({
    example: 5,
    nullable: true,
    description: 'Birth month (1-12)',
  })
  birthMonth: number | null;

  @ApiProperty({ example: 14, nullable: true, description: 'Birth day (1-31)' })
  birthDay: number | null;

  @ApiProperty({
    example: { Twitter: '@jane', Instagram: '@jane.doe' },
    nullable: true,
    type: Object,
  })
  socialMedias: Record<string, string> | null;

  @ApiProperty({ example: true, default: true })
  preferAnonymous: boolean;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  updatedAt: string;
}

export class UpcomingFriendDto extends FriendDto {
  @ApiProperty({
    example: 28,
    nullable: true,
    description:
      'Age the friend is turning on their next birthday, null if birthYear is unknown',
  })
  turningAge: number | null;

  @ApiProperty({
    example: '2026-08-14',
    description:
      "The friend's next occurring birthday date (year is the anchor year, not necessarily their birth year)",
  })
  nextBirthdayDate: string;
}

export class CreateFriendDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1998, required: false })
  @IsOptional()
  @IsInt()
  birthYear?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  birthMonth?: number;

  @ApiProperty({ example: 14, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  birthDay?: number;

  @ApiProperty({
    example: { Twitter: '@jane', Instagram: '@jane.doe' },
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  socialMedias?: Record<string, string>;

  @ApiProperty({ example: true, default: true, required: false })
  @IsOptional()
  @IsBoolean()
  preferAnonymous?: boolean;
}

export class UpdateFriendDto extends PartialType(CreateFriendDto) {}
