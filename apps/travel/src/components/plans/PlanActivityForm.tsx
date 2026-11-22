import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type {
  TravelParticipantMemberDto,
  TravelPlaceDto,
  TravelSpotDto,
} from '@hatohui/models';
import { Button, Input, Label } from '@hatohui/ui';

const SPOT_PREFIX = 'spot:';
const PLACE_PREFIX = 'place:';

interface PlanActivityFormProps {
  participants: TravelParticipantMemberDto[];
  places: TravelPlaceDto[];
  spots: TravelSpotDto[];
  isCreating: boolean;
  onSubmit: (data: {
    name: string;
    from: string;
    to: string;
    placeId?: string;
    spotId?: string;
    location?: string;
    mapsUrl?: string;
    note?: string;
    involvedPeople?: string[];
    isExcludeMode?: boolean;
  }) => Promise<void>;
}

function PlanActivityForm({
  participants,
  places,
  spots,
  isCreating,
  onSubmit,
}: PlanActivityFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [location, setLocation] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [note, setNote] = useState('');
  const [involved, setInvolved] = useState<string[]>([]);
  const [isExcludeMode, setIsExcludeMode] = useState(false);

  const toggleUser = (userId: string) => {
    setInvolved((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !from || !to) return;
        const spotId = targetValue.startsWith(SPOT_PREFIX)
          ? targetValue.slice(SPOT_PREFIX.length)
          : undefined;
        const placeId = targetValue.startsWith(PLACE_PREFIX)
          ? targetValue.slice(PLACE_PREFIX.length)
          : undefined;
        void onSubmit({
          name: name.trim(),
          from: new Date(from).toISOString(),
          to: new Date(to).toISOString(),
          placeId,
          spotId,
          location: location.trim() || undefined,
          mapsUrl: mapsUrl.trim() || undefined,
          note: note.trim() || undefined,
          involvedPeople: involved,
          isExcludeMode,
        });
      }}
      className="space-y-4 rounded-xl border border-border bg-card p-4"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="act-name">{t('plans.timeline.form.name')}</Label>
          <Input
            id="act-name"
            required
            value={name}
            placeholder={t('plans.timeline.form.namePlaceholder')}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="act-from">{t('plans.timeline.form.from')}</Label>
          <Input
            id="act-from"
            type="datetime-local"
            required
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="act-to">{t('plans.timeline.form.to')}</Label>
          <Input
            id="act-to"
            type="datetime-local"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="act-place">{t('plans.timeline.form.place')}</Label>
          <select
            id="act-place"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
          >
            <option value="">{t('plans.timeline.form.noPlace')}</option>
            {spots.length > 0 && (
              <optgroup label={t('plans.timeline.form.spotGroup')}>
                {spots.map((s) => (
                  <option key={s.id} value={`${SPOT_PREFIX}${s.id}`}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            )}
            {places.length > 0 && (
              <optgroup label={t('plans.timeline.form.foodPlaceGroup')}>
                {places.map((p) => (
                  <option key={p.id} value={`${PLACE_PREFIX}${p.id}`}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="act-loc">{t('plans.timeline.form.location')}</Label>
          <Input
            id="act-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="act-maps">{t('plans.timeline.form.mapsUrl')}</Label>
          <Input
            id="act-maps"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>{t('plans.timeline.form.involved')}</Label>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={isExcludeMode}
              onChange={(e) => setIsExcludeMode(e.target.checked)}
            />
            <span>{t('plans.timeline.form.excludeMode')}</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {participants.map((member) => {
            const active = involved.includes(member.userId);
            return (
              <button
                key={member.userId}
                type="button"
                onClick={() => toggleUser(member.userId)}
                className={[
                  'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground',
                ].join(' ')}
              >
                {member.displayName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="act-note">{t('plans.timeline.form.note')}</Label>
        <Input
          id="act-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button type="submit" size="sm" disabled={isCreating}>
        {isCreating
          ? t('plans.timeline.form.saving')
          : t('plans.timeline.form.submit')}
      </Button>
    </form>
  );
}

export default PlanActivityForm;
