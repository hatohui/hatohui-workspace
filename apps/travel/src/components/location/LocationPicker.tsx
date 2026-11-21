import { useTranslation } from '@hatohui/i18n';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@hatohui/ui';
import { MapPinned } from 'lucide-react';
import { useTravelLocation } from '../../hooks/useTravelLocation';
import LocationSelects from './LocationSelects';

function LocationPicker() {
  const { t } = useTranslation();
  const { country, area } = useTravelLocation();
  const label = area?.name ?? country?.name ?? t('location.everywhere');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-44 rounded-full"
          aria-label={t('location.pick')}
        >
          <MapPinned />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <LocationSelects />
      </PopoverContent>
    </Popover>
  );
}

export default LocationPicker;
