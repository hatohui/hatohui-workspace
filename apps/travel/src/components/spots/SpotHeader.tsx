import { useTranslation } from '@hatohui/i18n';
import type { TravelSpotDto } from '@hatohui/models';
import { MapPin } from 'lucide-react';
import type { useConfirmedDelete } from '../../hooks/useConfirmedDelete';
import { useDialogState } from '../../hooks/useDialogState';
import {
  formatPlaceLocation,
  hasPlaceCoordinates,
} from '../../lib/formatPlaceLocation';
import CategoryChips from '../shared/CategoryChips';
import CreatorBadge from '../shared/CreatorBadge';
import EntityActions from '../shared/EntityActions';
import MapsLink from '../shared/MapsLink';
import SpotDialog from './SpotDialog';
import SpotTagBadges from './SpotTagBadges';

interface Props {
  spot: TravelSpotDto;
  deletion: ReturnType<typeof useConfirmedDelete>;
}

function SpotHeader({ spot, deletion }: Props) {
  const { t } = useTranslation();
  const editor = useDialogState();
  const location = formatPlaceLocation(spot);
  const hasMap = hasPlaceCoordinates(spot);

  return (
    <header className="space-y-3 border-b border-border/60 pb-6">
      <h1 className="text-3xl font-medium tracking-tight">{spot.name}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {(location || !hasMap) && (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden />
            {location || t('spots.noLocation')}
          </span>
        )}
        <MapsLink href={spot.mapsUrl} />
      </div>
      <CategoryChips categories={spot.categories} />
      <SpotTagBadges specials={spot.specials} tags={spot.tags} />
      {spot.note && (
        <p className="max-w-prose leading-relaxed whitespace-pre-line text-muted-foreground">
          {spot.note}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CreatorBadge creator={spot.createdBy} />
        <EntityActions
          onEdit={editor.show}
          deletion={deletion}
          deleteTitle={t('spots.deleteTitle')}
          deleteDescription={t('spots.deleteDescription', {
            name: spot.name,
          })}
        />
      </div>
      <SpotDialog key={editor.version} state={editor} spot={spot} />
    </header>
  );
}

export default SpotHeader;
