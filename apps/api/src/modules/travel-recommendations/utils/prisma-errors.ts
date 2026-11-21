import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UNIQUE_VIOLATION_CODE } from '@/modules/travel-recommendations/travel-recommendations.constants';

const RECORD_NOT_FOUND_CODE = 'P2025';

export function translatePrismaError(
  error: unknown,
  messages: { conflict: string; notFound: string },
): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === UNIQUE_VIOLATION_CODE) {
      return new ConflictException(messages.conflict);
    }
    if (error.code === RECORD_NOT_FOUND_CODE) {
      return new NotFoundException(messages.notFound);
    }
  }
  return error instanceof Error ? error : new Error(String(error));
}
