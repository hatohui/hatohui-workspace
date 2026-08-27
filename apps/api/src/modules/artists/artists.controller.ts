import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArtistsService } from '@/modules/artists/services/artists.service';
import { PublicUserDto } from '@/modules/users/dto/public-user.dto';

@ApiTags('artists')
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  @ApiOperation({
    operationId: 'artists',
    summary: 'List every artist with a public storefront handle',
  })
  @ApiOkResponse({ type: PublicUserDto, isArray: true })
  list(): Promise<PublicUserDto[]> {
    return this.artistsService.list();
  }

  @Get(':handle')
  @ApiOperation({
    operationId: 'artistByHandle',
    summary: "Resolve an artist's storefront handle",
  })
  @ApiOkResponse({ type: PublicUserDto })
  async byHandle(@Param('handle') handle: string): Promise<PublicUserDto> {
    const artist = await this.artistsService.findByHandle(handle);
    if (!artist) {
      throw new NotFoundException(`Artist ${handle} not found`);
    }
    return artist;
  }
}
