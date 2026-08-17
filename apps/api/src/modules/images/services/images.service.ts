import { Injectable } from '@nestjs/common';
import { Storage } from '@/infra/storage';
import { stagedUploadKey } from '@/common/utils/asset-paths';
import {
  SignImageDto,
  SignedImageDto,
} from '@/modules/images/dto/sign-image.dto';
import { UPLOAD_URL_EXPIRY_SECONDS } from '@/modules/images/images.constants';

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

@Injectable()
export class ImagesService {
  constructor(private readonly storage: Storage) {}

  /// Signs into the uploader's staging prefix rather than the object's final
  /// home: the record that will own it (a profile, a commission) often does
  /// not exist yet at this point. Whichever service persists the returned key
  /// relocates the object — see `@/common/utils/asset-paths`.
  async sign(dto: SignImageDto, uploaderId: string): Promise<SignedImageDto> {
    const extension = EXTENSION_BY_CONTENT_TYPE[dto.contentType];
    const key = stagedUploadKey(uploaderId, extension);

    const uploadUrl = await this.storage.getSignedUploadUrl(
      key,
      dto.contentType,
      UPLOAD_URL_EXPIRY_SECONDS,
    );

    return {
      uploadUrl,
      key,
      publicUrl: this.storage.getPublicUrl(key),
      expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
    };
  }
}
