import { ApiProperty } from '@nestjs/swagger';
import {
  ARTIST_SETUP_STEPS,
  type ArtistSetupStep,
} from '@/modules/artist-setup/artist-setup.constants';

export class ArtistSetupStepDto {
  @ApiProperty({ enum: ARTIST_SETUP_STEPS })
  key: ArtistSetupStep;

  @ApiProperty()
  done: boolean;
}

export class ArtistSetupDto {
  @ApiProperty({
    type: ArtistSetupStepDto,
    isArray: true,
    description: 'Setup steps in order, each marked done from real data',
  })
  steps: ArtistSetupStepDto[];

  @ApiProperty({
    enum: ARTIST_SETUP_STEPS,
    nullable: true,
    description: 'First step not done yet; null when everything is done',
  })
  nextStep: ArtistSetupStep | null;

  @ApiProperty({ description: 'Whether the artist chose to skip setup' })
  dismissed: boolean;

  @ApiProperty({
    description: 'Whether the workspace should send the artist to setup',
  })
  shouldShow: boolean;
}
