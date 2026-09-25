import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { OptionalAuthGuard } from '@/modules/auth/guards/optional-auth.guard';
import { OptionalCurrentUser } from '@/modules/auth/decorators/optional-current-user.decorator';
import { SignRateLimitGuard } from '@/modules/images/guards/sign-rate-limit.guard';
import {
  SignImageDto,
  SignedImageDto,
} from '@/modules/images/dto/sign-image.dto';
import { ImagesService } from '@/modules/images/services/images.service';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('sign')
  @UseGuards(OptionalAuthGuard, SignRateLimitGuard)
  @ApiOperation({
    operationId: 'signImage',
    summary: 'Get a presigned URL to upload an image directly to storage',
  })
  @ApiOkResponse({ type: SignedImageDto })
  sign(
    @Body() dto: SignImageDto,
    @OptionalCurrentUser() uploader: User | null,
  ): Promise<SignedImageDto> {
    return this.imagesService.sign(dto, uploader?.id ?? null);
  }
}
