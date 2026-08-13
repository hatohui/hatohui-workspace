import { useTranslation } from '@hatohui/i18n';
import { Avatar, ErrorState, LoadingDots } from '@hatohui/ui';
import { useAuth } from '@hatohui/libs';
import { useSocialGraph } from '../../hooks/useSocialGraph';
import {
  SOCIAL_TREE_SIZE,
  useSocialTreeLayout,
} from '../../hooks/useSocialTreeLayout';
import SocialTreeNode from './SocialTreeNode';

function SocialTree() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useSocialGraph();
  const graphNodes = data?.data.friends ?? [];
  const { nodes, edges } = useSocialTreeLayout(graphNodes);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingDots label={t('common:loading')} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={t('common:loadError')}
        retry={{ label: t('common:retry'), onClick: () => void refetch() }}
      />
    );
  }

  if (graphNodes.length === 0) {
    return <p className="text-muted-foreground">{t('social.empty')}</p>;
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <svg
        viewBox={`0 0 ${SOCIAL_TREE_SIZE.toString()} ${SOCIAL_TREE_SIZE.toString()}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {edges.map((edge) => (
          <line
            key={edge.key}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-border"
            style={{ opacity: edge.opacity }}
          />
        ))}
      </svg>

      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
        style={{ left: '50%', top: '50%' }}
      >
        <Avatar
          src={user?.avatarUrl}
          alt={user?.name ?? ''}
          className="size-14 ring-2 ring-primary ring-offset-2 ring-offset-background"
        />
        <span className="text-xs text-muted-foreground">{t('social.you')}</span>
      </div>

      {nodes.map((node) => (
        <SocialTreeNode
          key={node.key}
          friend={node.friend}
          parentName={node.parentName}
          size={node.depth === 1 ? 'md' : 'sm'}
          className={node.depth === 1 ? 'opacity-90' : 'opacity-55'}
          style={{
            left: `${((node.x / SOCIAL_TREE_SIZE) * 100).toString()}%`,
            top: `${((node.y / SOCIAL_TREE_SIZE) * 100).toString()}%`,
          }}
        />
      ))}
    </div>
  );
}

export default SocialTree;
