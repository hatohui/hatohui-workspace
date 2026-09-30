'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  useMarkCommissionSeenByClient,
  type CommentDto,
  type CommissionPublicDetailDto,
} from '@hatohui/models';
import type { useCommissionCodeLookup } from './useCommissionLookup';
import { updateSeenState, type SeenState } from '@/lib/seenState';
import { useMarkSeenOnce } from './useMarkSeenOnce';
import type { CommentInput } from './useCommentComposer';
import { useClientAttachmentUpload } from './useAttachmentUpload';
import { useCommissionProgressByAccessCode } from './useCommissionProgress';

export interface OrderApproval {
  approvedAt: string | null;
  isApproving: boolean;
}

export interface OrderUpdatePostData {
  id: string;
  progressId?: string;
  date: string;
  title: string | null;
  description: string | null;
  body: object | null;
  images: string[];
  comments: CommentDto[];
  seenState: SeenState;
  approval: OrderApproval | null;
}

export function useOrderUpdates(
  code: string,
  commission: CommissionPublicDetailDto,
  lookup: ReturnType<typeof useCommissionCodeLookup>,
) {
  const { t } = useTranslation('art');
  const progress = useCommissionProgressByAccessCode(code);
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const upload = useClientAttachmentUpload(code);
  const { mutate: markSeen } = useMarkCommissionSeenByClient();
  useMarkSeenOnce(
    !progress.isLoading,
    useCallback(() => markSeen({ code }), [markSeen, code]),
  );

  const chronological = useMemo<OrderUpdatePostData[]>(
    () => [
      {
        id: commission.id,
        date: commission.createdAt,
        title: t('orders.requestPost'),
        description: null,
        body: commission.idea,
        images: commission.referenceAssets,
        comments: [...commission.comments].reverse(),
        seenState: null,
        approval: null,
      },
      ...progress.items.map((item) => ({
        id: item.id,
        progressId: item.id,
        date: item.createdAt,
        title: item.title,
        description: item.description,
        body: item.body,
        images: item.images,
        comments: item.comments,
        seenState: updateSeenState(item.seenByClientAt, false),
        approval: item.requestsApproval
          ? {
              approvedAt: item.approvedAt,
              isApproving: lookup.approvingId === item.id,
            }
          : null,
      })),
    ],
    [commission, progress.items, lookup.approvingId, t],
  );
  const posts = useMemo(
    () => (isNewestFirst ? [...chronological].reverse() : chronological),
    [chronological, isNewestFirst],
  );

  return {
    posts,
    upload,
    isNewestFirst,
    flipOrder: () => setIsNewestFirst((value) => !value),
    isLoading: progress.isLoading,
    hasProgress: progress.items.length > 0,
    comment: (post: OrderUpdatePostData, input: CommentInput) =>
      lookup.addNote(input, post.progressId),
    approve: (post: OrderUpdatePostData) => {
      if (post.progressId) void lookup.approve(post.progressId);
    },
  };
}
