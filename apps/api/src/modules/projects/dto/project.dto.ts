import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProjectDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'Genshin Impact character set' })
  title: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Whether this project is hidden from the public gallery',
  })
  isHidden: boolean;

  @ApiProperty({
    nullable: true,
    description: "First deliverable asset URL from the project's commissions",
  })
  coverAssetUrl: string | null;

  @ApiProperty()
  commissionCount: number;

  @ApiProperty({ type: [String] })
  deliverableAssets: string[];

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  updatedAt: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Genshin Impact character set' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectDto {
  @ApiProperty({ example: 'Genshin Impact character set' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectVisibilityDto {
  @ApiProperty()
  @IsBoolean()
  isHidden: boolean;
}
