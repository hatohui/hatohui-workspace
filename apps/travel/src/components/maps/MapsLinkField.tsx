import { useTranslation } from '@hatohui/i18n';
import { Spinner } from '@hatohui/ui';
import { useMapsLinkPreview } from '../../hooks/useMapsLinkPreview';
import TextField from '../shared/TextField';
import MapFrame from './MapFrame';
import UseLinkNameButton from './UseLinkNameButton';

interface Props {
  id: string;
  url: string;
  placeName: string;
  onUrlChange: (url: string) => void;
  onUseName: (name: string) => void;
}

function MapsLinkField({ id, url, placeName, onUrlChange, onUseName }: Props) {
  const { t } = useTranslation();
  const preview = useMapsLinkPreview(url, placeName);

  return (
    <div className="space-y-2">
      <TextField
        id={id}
        type="url"
        label={t('form.mapsUrl')}
        placeholder={t('form.mapsUrlPlaceholder')}
        value={url}
        onChange={(next) => {
          if (next.trim() !== url.trim()) preview.clearAppliedName();
          onUrlChange(next);
        }}
      />
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        {preview.isLoading && <Spinner />}
        {preview.notFound ? t('form.linkNoLocation') : t('form.mapsUrlHint')}
      </p>
      {preview.suggestedName && (
        <UseLinkNameButton
          name={preview.suggestedName}
          onUse={(name) => {
            preview.markNameApplied();
            onUseName(name);
          }}
        />
      )}
      <MapFrame target={preview.target} title={t('form.mapPreview')} />
    </div>
  );
}

export default MapsLinkField;
