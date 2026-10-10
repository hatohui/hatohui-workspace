import { cn } from '@hatohui/ui';
import { LANDING_BLOBS, LANDING_DECOR } from '@/constants/landing';

export function LandingBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {LANDING_BLOBS.map((blob) => (
        <div
          key={blob.position}
          data-landing="parallax"
          data-depth={blob.depth}
          className={cn('absolute', blob.position)}
        >
          <div
            data-landing="float"
            className={cn('size-full rounded-full blur-3xl', blob.color)}
          />
        </div>
      ))}
      {LANDING_DECOR.map(({ icon: Icon, className, depth }) => (
        <div
          key={className}
          data-landing="parallax"
          data-depth={depth}
          className={cn('absolute', className)}
        >
          <Icon data-landing="float" className="size-full" />
        </div>
      ))}
    </div>
  );
}
