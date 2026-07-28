import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Storage } from '@/libs/storage';
import { SignImageDto, SignedImageDto } from './dto/sign-image.dto';

const UPLOAD_URL_EXPIRY_SECONDS = 300;

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

  async sign(dto: SignImageDto): Promise<SignedImageDto> {
    const extension = EXTENSION_BY_CONTENT_TYPE[dto.contentType];
    const key = `images/${randomUUID()}.${extension}`;

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
