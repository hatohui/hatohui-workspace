import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.guard';
import type { User } from '@prisma/client';

export const OptionalCurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User | null => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user ?? null;
  },
);
