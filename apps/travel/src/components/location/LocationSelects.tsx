import { useTranslation } from '@hatohui/i18n';
import { ALL_OPTION } from '../../constants/location';
import { useTravelLocation } from '../../hooks/useTravelLocation';
import OptionSelect from '../shared/OptionSelect';

function LocationSelects() {
  const { t } = useTranslation();
  const { countries, country, area, setCountry, setArea } = useTravelLocation();
  const toId = (value: string) => (value === ALL_OPTION ? null : value);

  return (
    <div className="space-y-3">
      <OptionSelect
        label={t('location.country')}
        value={country?.id ?? ALL_OPTION}
        onChange={(value) => setCountry(toId(value))}
        options={[
          { value: ALL_OPTION, label: t('location.allCountries') },
          ...countries.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />
      <OptionSelect
        label={t('location.area')}
        value={area?.id ?? ALL_OPTION}
        disabled={!country}
        onChange={(value) => setArea(toId(value))}
        options={[
          { value: ALL_OPTION, label: t('location.allAreas') },
          ...(country?.areas ?? []).map((a) => ({
            value: a.id,
            label: a.name,
          })),
        ]}
      />
    </div>
  );
}

export default LocationSelects;
