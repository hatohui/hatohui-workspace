import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClientsService } from '@/modules/clients/services/clients.service';
import { ClientPrefillDto } from '@/modules/clients/dto/client.dto';
import { ClientDetailDto } from '@/modules/clients/dto/client-detail.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('lookup')
  @ApiOperation({
    operationId: 'lookupClientByEmail',
    summary:
      "Prefill data for a returning client. 404 if this email hasn't commissioned before.",
  })
  @ApiQuery({ name: 'email', required: true, type: String })
  @ApiOkResponse({ type: ClientPrefillDto })
  async lookup(@Query('email') email: string): Promise<ClientPrefillDto> {
    const prefill = await this.clientsService.lookupByEmail(email);
    if (!prefill) {
      throw new NotFoundException(`No client found for ${email}`);
    }
    return prefill;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'client',
    summary:
      'A client of yours, with their linked account and their commissions with you',
  })
  @ApiOkResponse({ type: ClientDetailDto })
  detail(
    @Param('id') id: string,
    @CurrentUser() artist: User,
  ): Promise<ClientDetailDto> {
    return this.clientsService.detailForArtist(artist.id, id);
  }
}
