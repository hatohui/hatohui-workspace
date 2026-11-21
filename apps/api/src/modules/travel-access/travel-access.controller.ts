import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { OptionalAuthGuard } from '@/modules/auth/guards/optional-auth.guard';
import { OptionalCurrentUser } from '@/modules/auth/decorators/optional-current-user.decorator';
import { TravelAccessService } from '@/modules/travel-access/services/travel-access.service';
import { TravelAccessDto } from '@/modules/travel-access/dto/travel-access.dto';

@ApiTags('travel')
@Controller('travel/access')
export class TravelAccessController {
  constructor(private readonly access: TravelAccessService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'travelAccess',
    summary: 'What the viewer may do in the travel app',
  })
  @ApiOkResponse({ type: TravelAccessDto })
  async get(
    @OptionalCurrentUser() user: User | null,
  ): Promise<TravelAccessDto> {
    return { canEdit: await this.access.canEdit(user) };
  }
}
