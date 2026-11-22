import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { ALLERGEN_ICONS } from '../../constants/travel';
import type { useAllergySettings } from '../../hooks/useAllergySettings';
import TagChipGroup from '../shared/TagChipGroup';
import FormCardSkeleton from '../shared/FormCardSkeleton';

type Props = ReturnType<typeof useAllergySettings>;

function AllergiesForm(props: Props) {
  const { t } = useTranslation();

  if (props.isLoading) {
    return <FormCardSkeleton fields={1} />;
  }

  return (
    <section className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-medium">
          {t('settings.allergies.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.allergies.description')}
        </p>
      </div>
      <TagChipGroup
        label={t('settings.allergies.title')}
        tone="warning"
        options={props.options}
        selected={props.selected}
        labelOf={props.labelOf}
        iconOf={(key) => ALLERGEN_ICONS[key]}
        onToggle={props.toggle}
      />
      <Button
        onClick={() => void props.save()}
        disabled={!props.isDirty || props.isSaving}
      >
        {t(props.isSaving ? 'form.saving' : 'form.save')}
      </Button>
    </section>
  );
}

export default AllergiesForm;
