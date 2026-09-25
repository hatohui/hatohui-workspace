import { ApiProperty } from '@nestjs/swagger';
import { CommissionDto } from '@/modules/commissions/dto/commission.dto';
import { CommissionOpeningDto } from '@/modules/commission-openings/dto/commission-opening.dto';

export class ArtistDashboardCountsDto {
  @ApiProperty()
  pending: number;

  @ApiProperty()
  inProgress: number;

  @ApiProperty()
  completed: number;

  @ApiProperty()
  total: number;
}

export class ArtistDashboardEarningsDto {
  @ApiProperty({ description: 'Minor units, paid this calendar month (UTC)' })
  paidThisMonth: number;

  @ApiProperty({ description: 'Minor units, quoted on in-progress work' })
  inProgressValue: number;
}

export class ArtistDashboardDto {
  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ type: ArtistDashboardCountsDto })
  counts: ArtistDashboardCountsDto;

  @ApiProperty({ type: ArtistDashboardEarningsDto })
  earnings: ArtistDashboardEarningsDto;

  @ApiProperty({ type: CommissionOpeningDto, nullable: true })
  opening: CommissionOpeningDto | null;

  @ApiProperty({ type: [CommissionDto] })
  recentRequests: CommissionDto[];

  @ApiProperty({ type: [CommissionDto] })
  upcomingDeadlines: CommissionDto[];
}
