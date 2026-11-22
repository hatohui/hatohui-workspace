import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { SKELETON_REVEAL_CLASS } from '../../constants/skeleton';

interface Props {
  className?: string;
  children: ReactNode;
}

function SkeletonReveal({ className, children }: Props) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t('common:loading')}
      className={cn(SKELETON_REVEAL_CLASS, className)}
    >
      {children}
    </div>
  );
}

export default SkeletonReveal;
