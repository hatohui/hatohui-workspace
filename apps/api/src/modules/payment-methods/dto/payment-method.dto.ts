import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
  @ApiProperty({ example: 'paypal', description: 'Stable identifier' })
  key: string;

  @ApiProperty({ example: 'PayPal' })
  name: string;
}
