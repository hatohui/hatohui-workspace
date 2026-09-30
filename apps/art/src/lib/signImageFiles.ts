import {
  signImageBatch,
  type SignImageBatchItemDtoContentType,
  type SignedImageDto,
} from '@hatohui/models';

export async function signImageFiles(
  files: File[],
  uploaderName?: string,
): Promise<SignedImageDto[]> {
  const response = await signImageBatch({
    files: files.map((file) => ({
      fileName: file.name,
      contentType: file.type as SignImageBatchItemDtoContentType,
      size: file.size,
    })),
    uploaderName,
  });
  return response.data.items;
}
