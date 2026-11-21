import { useTranslation } from '@hatohui/i18n';
import { ExternalLink } from 'lucide-react';

function MapsLink({ href }: { href: string | null }) {
  const { t } = useTranslation();
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
    >
      {t('recommendation.openMaps')}
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}

export default MapsLink;
