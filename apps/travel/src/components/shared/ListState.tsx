import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { ErrorState } from '@hatohui/ui';
import CardGridSkeleton from './CardGridSkeleton';
import EmptyState from './EmptyState';

interface Props {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  emptyIcon: LucideIcon;
  emptyMessage: string;
  children: ReactNode;
}

function ListState(props: Props) {
  const { t } = useTranslation();
  if (props.isLoading) return <CardGridSkeleton />;
  if (props.isError) {
    return (
      <ErrorState
        message={t('common:loadError')}
        retry={{ label: t('common:retry'), onClick: props.onRetry }}
      />
    );
  }
  if (props.isEmpty) {
    return <EmptyState icon={props.emptyIcon} message={props.emptyMessage} />;
  }
  return <>{props.children}</>;
}

export default ListState;
