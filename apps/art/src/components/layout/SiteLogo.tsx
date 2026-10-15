import { SITE_LOGO_SRC } from '@/constants/navigation';

export function SiteLogo() {
  const mask = `url(${SITE_LOGO_SRC}) center / contain no-repeat`;

  return (
    <span
      aria-hidden
      className="size-8 shrink-0 bg-current"
      style={{ mask, WebkitMask: mask }}
    />
  );
}
