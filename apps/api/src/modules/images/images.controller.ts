import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { OptionalAuthGuard } from '@/modules/auth/guards/optional-auth.guard';
import { OptionalCurrentUser } from '@/modules/auth/decorators/optional-current-user.decorator';
import { SignRateLimitGuard } from '@/modules/images/guards/sign-rate-limit.guard';
import {
  ImageUploadLimitsDto,
  SignImageDto,
  SignedImageDto,
} from '@/modules/images/dto/sign-image.dto';
import {
  SignImageBatchDto,
  SignedImageBatchDto,
} from '@/modules/images/dto/sign-image-batch.dto';
import { ImagesService } from '@/modules/images/services/images.service';
import { ImageUploadLimitsService } from '@/modules/images/services/image-upload-limits.service';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly uploadLimits: ImageUploadLimitsService,
  ) {}

  @Get('upload-limits')
  @ApiOperation({
    operationId: 'imageUploadLimits',
    summary: 'Largest accepted image and most images signed per request',
  })
  @ApiOkResponse({ type: ImageUploadLimitsDto })
  limits(): Promise<ImageUploadLimitsDto> {
    return this.uploadLimits.get();
  }

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

  @Post('sign/batch')
  @UseGuards(OptionalAuthGuard, SignRateLimitGuard)
  @ApiOperation({
    operationId: 'signImageBatch',
    summary: 'Get presigned upload URLs for several images in one request',
  })
  @ApiOkResponse({ type: SignedImageBatchDto })
  signBatch(
    @Body() dto: SignImageBatchDto,
    @OptionalCurrentUser() uploader: User | null,
  ): Promise<SignedImageBatchDto> {
    return this.imagesService.signBatch(dto, uploader?.id ?? null);
  }
}
