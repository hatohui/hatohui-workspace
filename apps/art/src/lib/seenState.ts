import type { CommentDto } from '@hatohui/models';

export type SeenState = 'new' | 'seen' | 'unseen' | null;

export function commentSeenState(
  comment: CommentDto,
  viewerRole: CommentDto['authorRole'],
  showReceipts: boolean,
): SeenState {
  if (comment.authorRole !== viewerRole) return comment.seenAt ? null : 'new';
  if (!showReceipts || comment.visibility !== 'CLIENT') return null;
  return comment.seenAt ? 'seen' : 'unseen';
}

export function updateSeenState(
  seenByClientAt: string | null,
  isArtist: boolean,
): SeenState {
  if (isArtist) return seenByClientAt ? 'seen' : 'unseen';
  return seenByClientAt ? null : 'new';
}
