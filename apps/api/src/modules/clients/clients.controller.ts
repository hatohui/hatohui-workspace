import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClientsService } from '@/modules/clients/services/clients.service';
import { ClientPrefillDto } from '@/modules/clients/dto/client.dto';

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
}
