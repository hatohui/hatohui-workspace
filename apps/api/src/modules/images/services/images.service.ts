import { BadRequestException, Injectable } from '@nestjs/common';
import { Storage } from '@/infra/storage';
import { pathSegmentOf, stagedUploadKey } from '@/common/utils/asset-paths';
import {
  SignImageDto,
  SignedImageDto,
} from '@/modules/images/dto/sign-image.dto';
import {
  SignImageBatchDto,
  SignedImageBatchDto,
} from '@/modules/images/dto/sign-image-batch.dto';
import { UPLOAD_URL_EXPIRY_SECONDS } from '@/modules/images/images.constants';
import { ImageUploadLimitsService } from '@/modules/images/services/image-upload-limits.service';

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

@Injectable()
export class ImagesService {
  constructor(
    private readonly storage: Storage,
    private readonly limits: ImageUploadLimitsService,
  ) {}

  /// Signs into the uploader's staging prefix rather than the object's final
  /// home: the record that will own it (a profile, a commission) often does
  /// not exist yet at this point. Whichever service persists the returned key
  /// relocates the object — see `@/common/utils/asset-paths`.
  async sign(
    dto: SignImageDto,
    uploaderId: string | null,
  ): Promise<SignedImageDto> {
    const { maxBytes } = await this.limits.get();
    this.assertSize(dto.size, maxBytes);
    return this.signOne(dto, uploaderId);
  }

  async signBatch(
    dto: SignImageBatchDto,
    uploaderId: string | null,
  ): Promise<SignedImageBatchDto> {
    const { maxBytes, maxFiles } = await this.limits.get();
    if (dto.files.length > maxFiles) {
      throw new BadRequestException(
        `At most ${maxFiles} images can be uploaded at once`,
      );
    }
    dto.files.forEach((file) => this.assertSize(file.size, maxBytes));
    const items = await Promise.all(
      dto.files.map((file) =>
        this.signOne({ ...file, uploaderName: dto.uploaderName }, uploaderId),
      ),
    );
    return { items };
  }

  private assertSize(size: number, maxBytes: number): void {
    if (size > maxBytes) {
      throw new BadRequestException(`Images must be at most ${maxBytes} bytes`);
    }
  }

  private async signOne(
    dto: SignImageDto,
    uploaderId: string | null,
  ): Promise<SignedImageDto> {
    const extension = EXTENSION_BY_CONTENT_TYPE[dto.contentType];
    const key = stagedUploadKey(this.ownerOf(dto, uploaderId), extension);

    const uploadUrl = await this.storage.getSignedUploadUrl(
      key,
      dto.contentType,
      dto.size,
      UPLOAD_URL_EXPIRY_SECONDS,
    );

    return {
      uploadUrl,
      key,
      publicUrl: this.storage.getPublicUrl(key),
      expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
    };
  }

  private ownerOf(dto: SignImageDto, uploaderId: string | null): string {
    if (uploaderId) return uploaderId;
    if (!dto.uploaderName) {
      throw new BadRequestException(
        'uploaderName is required when not signed in',
      );
    }
    return pathSegmentOf(dto.uploaderName);
  }
}
