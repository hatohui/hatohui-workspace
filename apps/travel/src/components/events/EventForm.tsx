import { useTranslation } from '@hatohui/i18n';
import type { CreateTravelEventDtoVisibility } from '@hatohui/models';
import { Button, Input, Label } from '@hatohui/ui';
import DishPhotoField from '../dishes/DishPhotoField';
import FormCardSkeleton from '../shared/FormCardSkeleton';
import { EVENT_FORM_SKELETON_FIELDS } from '../../constants/skeleton';
import type { useTravelEventForm } from '../../hooks/useTravelEventForm';

type EventFormProps = ReturnType<typeof useTravelEventForm>;

function EventForm(props: EventFormProps) {
  const { t } = useTranslation();

  if (props.isLoading) {
    return <FormCardSkeleton fields={EVENT_FORM_SKELETON_FIELDS} />;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void props.submit();
      }}
      className="max-w-2xl space-y-5 rounded-xl border border-border bg-card p-5"
    >
      <h1 className="text-xl font-semibold">
        {props.isEdit
          ? t('events.form.editTitle')
          : t('events.form.createTitle')}
      </h1>

      <div className="space-y-1.5">
        <Label htmlFor="event-title">{t('events.form.title')}</Label>
        <Input
          id="event-title"
          required
          value={props.title}
          placeholder={t('events.form.titlePlaceholder')}
          onChange={(e) => props.setTitle(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="event-start">{t('events.form.startAt')}</Label>
          <Input
            id="event-start"
            type="datetime-local"
            required
            value={props.startAt}
            onChange={(e) => props.setStartAt(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event-end">{t('events.form.endAt')}</Label>
          <Input
            id="event-end"
            type="datetime-local"
            required
            value={props.endAt}
            onChange={(e) => props.setEndAt(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="event-visibility">
            {t('events.form.visibility')}
          </Label>
          <select
            id="event-visibility"
            value={props.visibility}
            onChange={(e) =>
              props.setVisibility(
                e.target.value as CreateTravelEventDtoVisibility,
              )
            }
            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
          >
            <option value="PUBLIC">{t('events.form.public')}</option>
            <option value="PRIVATE">{t('events.form.private')}</option>
          </select>
        </div>

        <label className="flex items-center gap-2 pt-6 text-sm">
          <input
            type="checkbox"
            checked={props.isYearly}
            onChange={(e) => props.setIsYearly(e.target.checked)}
          />
          <span>{t('events.form.isYearly')}</span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="event-location">{t('events.form.location')}</Label>
          <Input
            id="event-location"
            value={props.location}
            placeholder={t('events.form.locationPlaceholder')}
            onChange={(e) => props.setLocation(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event-maps">{t('events.form.mapsUrl')}</Label>
          <Input
            id="event-maps"
            value={props.mapsUrl}
            placeholder={t('form.mapsUrlPlaceholder')}
            onChange={(e) => props.setMapsUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-ref">{t('events.form.reference')}</Label>
        <Input
          id="event-ref"
          value={props.reference}
          placeholder="https://..."
          onChange={(e) => props.setReference(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-desc">{t('events.form.description')}</Label>
        <textarea
          id="event-desc"
          rows={4}
          value={props.description}
          placeholder={t('events.form.descriptionPlaceholder')}
          onChange={(e) => props.setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <DishPhotoField photo={props.photo} />

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <Button type="submit" disabled={props.isSaving}>
          {props.isSaving ? t('events.form.saving') : t('events.form.save')}
        </Button>
        {props.isEdit && (
          <Button
            type="button"
            variant="destructive"
            disabled={props.isDeleting}
            onClick={() => void props.remove()}
          >
            {t('events.form.delete')}
          </Button>
        )}
      </div>
    </form>
  );
}

export default EventForm;
