import { useTranslation } from '@hatohui/i18n';
import type { TravelCreatorDto } from '@hatohui/models';
import { Avatar } from '@hatohui/ui';

function CreatorBadge({ creator }: { creator: TravelCreatorDto | null }) {
  const { t } = useTranslation();
  if (!creator) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Avatar src={creator.avatarUrl} alt={creator.name} className="size-5" />
      {t('recommendation.addedBy', { name: creator.name })}
    </span>
  );
}

export default CreatorBadge;
