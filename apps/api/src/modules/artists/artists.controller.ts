import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArtistsService } from '@/modules/artists/services/artists.service';
import { PublicUserDto } from '@/modules/users/dto/public-user.dto';

@ApiTags('artists')
@Controller('artist')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  @ApiOperation({
    operationId: 'siteArtist',
    summary: 'The artist this site belongs to',
  })
  @ApiOkResponse({ type: PublicUserDto })
  async siteArtist(): Promise<PublicUserDto> {
    const artist = await this.artistsService.findSiteArtist();
    if (!artist) {
      throw new NotFoundException('Site artist not found');
    }
    return artist;
  }
}
