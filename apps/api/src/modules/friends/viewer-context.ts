import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import {
  ConnectionsService,
  EMPTY_CONNECTION_CONTEXT,
  type ConnectionContext,
} from '@/modules/connections/connections.service';

export interface ViewerContext {
  viewer: User | null;
  connections: ConnectionContext;
}

export const ANONYMOUS_CONTEXT: ViewerContext = {
  viewer: null,
  connections: EMPTY_CONNECTION_CONTEXT,
};

/// The accounts whose FRIENDS_ONLY birthdays the viewer may see: themselves
/// plus everyone they are connected with.
export function circleOf(ctx: ViewerContext): string[] {
  if (!ctx.viewer) return [];
  return [ctx.viewer.id, ...ctx.connections.connectedUserIds];
}

/// Resolves the viewer's connection graph once per request, so no query below
/// needs to know how connections are stored.
@Injectable()
export class ViewerContextService {
  constructor(private readonly connections: ConnectionsService) {}

  async for(viewer: User | null): Promise<ViewerContext> {
    if (!viewer) return ANONYMOUS_CONTEXT;
    return {
      viewer,
      connections: await this.connections.getContext(viewer.id),
    };
  }
}
