'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionPublicDetailDto } from '@hatohui/models';
import type { useCommissionCodeLookup } from '@/hooks/useCommissionLookup';
import { useOrderUpdates } from '@/hooks/useOrderUpdates';
import { OrderUpdatePost } from './OrderUpdatePost';
import { OrderFeedOrderToggle } from './OrderFeedOrderToggle';

export function OrderUpdatesFeed({
  code,
  commission,
  lookup,
}: {
  code: string;
  commission: CommissionPublicDetailDto;
  lookup: ReturnType<typeof useCommissionCodeLookup>;
}) {
  const { t } = useTranslation('art');
  const updates = useOrderUpdates(code, commission, lookup);

  return (
    <div className="space-y-4">
      <OrderFeedOrderToggle
        isNewestFirst={updates.isNewestFirst}
        onFlip={updates.flipOrder}
      />
      <ol className="space-y-5 border-l border-border pl-5">
        {updates.posts.map((post) => (
          <OrderUpdatePost
            key={post.id}
            post={post}
            upload={updates.upload}
            onComment={(input) => updates.comment(post, input)}
            onApprove={() => updates.approve(post)}
          />
        ))}
      </ol>
      {!updates.isLoading && !updates.hasProgress && (
        <p className="text-sm text-muted-foreground">{t('orders.noUpdates')}</p>
      )}
    </div>
  );
}
