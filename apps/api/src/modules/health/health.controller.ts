import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthDto } from '@/modules/health/dto/health.dto';
import { HealthService } from '@/modules/health/services/health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ operationId: 'health', summary: 'Report service health' })
  @ApiOkResponse({ type: HealthDto })
  check(): Promise<HealthDto> {
    return this.healthService.check();
  }
}
