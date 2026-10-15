import { Check } from 'lucide-react';
import { useCopyHandle } from './useCopyHandle';
import type { SocialLink } from './socialLinkData';

const ITEM_CLASS =
  'inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary';

export function SocialLinkItem({ link }: { link: SocialLink }) {
  const { copied, copy } = useCopyHandle(link.handle);
  const title = `${link.label}: ${link.handle}`;

  const icon = copied ? (
    <Check className="size-4" aria-hidden />
  ) : (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d={link.iconPath} />
    </svg>
  );

  if (link.href) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={title}
        title={title}
        className={ITEM_CLASS}
      >
        {icon}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={title}
      title={title}
      className={ITEM_CLASS}
    >
      {icon}
    </button>
  );
}
