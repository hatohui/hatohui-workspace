import { useTranslation } from '@hatohui/i18n';
import type { TravelPlaceDetailDto } from '@hatohui/models';
import { MapPin } from 'lucide-react';
import type { useConfirmedDelete } from '../../hooks/useConfirmedDelete';
import { useDialogState } from '../../hooks/useDialogState';
import {
  formatPlaceLocation,
  hasPlaceCoordinates,
} from '../../lib/formatPlaceLocation';
import CreatorBadge from '../shared/CreatorBadge';
import EntityActions from '../shared/EntityActions';
import MapsLink from '../shared/MapsLink';
import PlaceDialog from './PlaceDialog';

interface Props {
  place: TravelPlaceDetailDto;
  deletion: ReturnType<typeof useConfirmedDelete>;
}

function PlaceHeader({ place, deletion }: Props) {
  const { t } = useTranslation();
  const editor = useDialogState();
  const location = formatPlaceLocation(place);
  const hasMap = hasPlaceCoordinates(place);

  return (
    <header className="space-y-3 border-b border-border/60 pb-6">
      <h1 className="text-3xl font-medium tracking-tight">{place.name}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {(location || !hasMap) && (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden />
            {location || t('places.noLocation')}
          </span>
        )}
        <MapsLink href={place.mapsUrl} />
      </div>
      {place.note && (
        <p className="max-w-prose leading-relaxed whitespace-pre-line text-muted-foreground">
          {place.note}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CreatorBadge creator={place.createdBy} />
        <EntityActions
          onEdit={editor.show}
          deletion={deletion}
          deleteTitle={t('places.deleteTitle')}
          deleteDescription={t('places.deleteDescription', {
            name: place.name,
          })}
        />
      </div>
      <PlaceDialog key={editor.version} state={editor} place={place} />
    </header>
  );
}

export default PlaceHeader;
