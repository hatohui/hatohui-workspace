import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { SignRateLimitGuard } from '@/modules/images/guards/sign-rate-limit.guard';
import {
  SignImageDto,
  SignedImageDto,
} from '@/modules/images/dto/sign-image.dto';
import { CommissionAttachmentsService } from '@/modules/commission-attachments/services/commission-attachments.service';

@ApiTags('commission-attachments')
@Controller('commission-attachments')
export class CommissionAttachmentsController {
  constructor(private readonly attachments: CommissionAttachmentsService) {}

  @Post('code/:code/sign')
  @UseGuards(SignRateLimitGuard)
  @ApiOperation({
    operationId: 'signClientCommissionAttachment',
    summary:
      'Client uploads an image for a comment; deleted later unless a comment claims it',
  })
  @ApiOkResponse({ type: SignedImageDto })
  signForClient(
    @Param('code') code: string,
    @Body() dto: SignImageDto,
  ): Promise<SignedImageDto> {
    return this.attachments.signForClient(code, dto);
  }

  @Post(':commissionId/sign')
  @UseGuards(AuthGuard, SignRateLimitGuard)
  @ApiOperation({
    operationId: 'signCommissionAttachment',
    summary:
      'Artist uploads an image for a comment or update; deleted later unless claimed',
  })
  @ApiOkResponse({ type: SignedImageDto })
  signForArtist(
    @Param('commissionId') commissionId: string,
    @Body() dto: SignImageDto,
    @CurrentUser() user: User,
  ): Promise<SignedImageDto> {
    return this.attachments.signForArtist(user.id, commissionId, dto);
  }
}
