import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
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
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'signImage',
    summary: 'Get a presigned URL to upload an image directly to storage',
  })
  @ApiOkResponse({ type: SignedImageDto })
  sign(
    @Body() dto: SignImageDto,
    @CurrentUser() uploader: User,
  ): Promise<SignedImageDto> {
    return this.imagesService.sign(dto, uploader.id);
  }
}
