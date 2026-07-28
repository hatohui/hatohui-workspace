import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthDto } from './dto/health.dto';
import { HealthService } from './health.service';

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
