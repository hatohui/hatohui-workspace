import { SignImageDtoContentType } from '@hatohui/models';

export type ImageFileProblem = 'unsupportedType' | 'tooLarge';

const ALLOWED_CONTENT_TYPES = new Set<string>(
  Object.values(SignImageDtoContentType),
);

export function validateImageFile(
  file: File,
  maxBytes: number | undefined,
): ImageFileProblem | null {
  if (!ALLOWED_CONTENT_TYPES.has(file.type)) return 'unsupportedType';
  if (maxBytes !== undefined && file.size > maxBytes) return 'tooLarge';
  return null;
}
