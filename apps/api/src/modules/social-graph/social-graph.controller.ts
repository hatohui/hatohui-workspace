import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { SocialGraphDto } from '@/modules/social-graph/dto/social-graph.dto';
import { SocialGraphService } from '@/modules/social-graph/services/social-graph.service';
import type { User } from '@prisma/client';

@ApiTags('friends')
@Controller('friends')
export class SocialGraphController {
  constructor(private readonly socialGraph: SocialGraphService) {}

  @Get('social-graph')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'friendsSocialGraph',
    summary: 'Data for the social tree view',
  })
  @ApiOkResponse({ type: SocialGraphDto })
  getSocialGraph(@CurrentUser() viewer: User): Promise<SocialGraphDto> {
    return this.socialGraph.getSocialGraph(viewer);
  }
}
