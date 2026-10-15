'use client';

import { cn } from '@hatohui/ui';
import { useLandingCommissionStatus } from '@/hooks/useLandingCommissionStatus';

export function LandingCommissionStatus({ artistId }: { artistId: string }) {
  const status = useLandingCommissionStatus(artistId);

  return (
    <p className="inline-flex min-h-5 items-center gap-2 text-sm text-muted-foreground">
      {!status.isLoading && !status.isUnknown && (
        <>
          <span
            aria-hidden
            className={cn(
              'size-2 rounded-full',
              status.isOpen ? 'bg-primary' : 'bg-muted-foreground/40',
            )}
          />
          {status.label}
        </>
      )}
    </p>
  );
}
