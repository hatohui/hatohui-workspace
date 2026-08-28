import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentMethodDto } from '@/modules/payment-methods/dto/payment-method.dto';
import { PaymentMethodsService } from '@/modules/payment-methods/services/payment-methods.service';

@ApiTags('payment-methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @ApiOperation({
    operationId: 'paymentMethods',
    summary: 'List the active payment-method catalog entries',
  })
  @ApiOkResponse({ type: PaymentMethodDto, isArray: true })
  list(): Promise<PaymentMethodDto[]> {
    return this.paymentMethodsService.list();
  }
}
