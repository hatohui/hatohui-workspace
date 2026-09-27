export const ALLOWED_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export const UPLOAD_URL_EXPIRY_SECONDS = 900;

export const UPLOAD_LIMIT_PARAMETER_TYPES = {
  maxBytes: 'images.upload.maxbytes',
  maxFiles: 'images.upload.maxfiles',
} as const;
export const DEFAULT_MAX_IMAGE_UPLOAD_BYTES = 25 * 1024 * 1024;
export const DEFAULT_MAX_IMAGES_PER_UPLOAD = 10;
export const UPLOAD_LIMITS_CACHE_TTL_SECONDS = 300;
export const MAX_UPLOADER_NAME_LENGTH = 100;

export const SIGN_RATE_LIMIT_KEY_PREFIX = 'rate-limit:images:sign';
export const SIGN_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
export const SIGN_RATE_LIMIT_ANONYMOUS = 30;
export const SIGN_RATE_LIMIT_AUTHENTICATED = 300;
