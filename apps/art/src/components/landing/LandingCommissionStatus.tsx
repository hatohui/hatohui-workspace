'use client';

import { cn } from '@hatohui/ui';
import { useLandingCommissionStatus } from '@/hooks/useLandingCommissionStatus';

export function LandingCommissionStatus({ artistId }: { artistId: string }) {
  const status = useLandingCommissionStatus(artistId);

  if (status.isLoading) return null;

  return (
    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span
        aria-hidden
        className={cn(
          'size-2 rounded-full',
          status.isOpen ? 'bg-primary' : 'bg-muted-foreground/40',
        )}
      />
      {status.label}
    </p>
  );
}
