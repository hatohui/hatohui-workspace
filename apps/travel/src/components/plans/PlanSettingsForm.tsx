import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type {
  TravelParticipationGroupDto,
  UpdateTravelGroupSettingsDto,
} from '@hatohui/models';
import { Button, Input, Label } from '@hatohui/ui';

interface PlanSettingsFormProps {
  group: TravelParticipationGroupDto;
  isSaving: boolean;
  onSave: (data: UpdateTravelGroupSettingsDto) => Promise<void>;
  onDelete: () => Promise<void>;
}

function PlanSettingsForm({
  group,
  isSaving,
  onSave,
  onDelete,
}: PlanSettingsFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(group.name);
  const [isPublic, setIsPublic] = useState(group.isPublic);
  const [isMemberInviteAllowed, setIsMemberInviteAllowed] = useState(
    group.isMemberInviteAllowed,
  );
  const [isActivityPublicVisible, setIsActivityPublicVisible] = useState(
    group.isActivityPublicVisible,
  );
  const [isMemberListPublicVisible, setIsMemberListPublicVisible] = useState(
    group.isMemberListPublicVisible,
  );
  const [isMediaPublicVisible, setIsMediaPublicVisible] = useState(
    group.isMediaPublicVisible,
  );

  const toggles = [
    {
      key: 'isPublic',
      checked: isPublic,
      set: setIsPublic,
      label: t('plans.settings.isPublic'),
    },
    {
      key: 'isMemberInviteAllowed',
      checked: isMemberInviteAllowed,
      set: setIsMemberInviteAllowed,
      label: t('plans.settings.isMemberInviteAllowed'),
    },
    {
      key: 'isActivityPublicVisible',
      checked: isActivityPublicVisible,
      set: setIsActivityPublicVisible,
      label: t('plans.settings.isActivityPublicVisible'),
    },
    {
      key: 'isMemberListPublicVisible',
      checked: isMemberListPublicVisible,
      set: setIsMemberListPublicVisible,
      label: t('plans.settings.isMemberListPublicVisible'),
    },
    {
      key: 'isMediaPublicVisible',
      checked: isMediaPublicVisible,
      set: setIsMediaPublicVisible,
      label: t('plans.settings.isMediaPublicVisible'),
    },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({
          name: name.trim() || group.name,
          isPublic,
          isMemberInviteAllowed,
          isActivityPublicVisible,
          isMemberListPublicVisible,
          isMediaPublicVisible,
        });
      }}
      className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-5"
    >
      <h2 className="text-base font-medium">{t('plans.settings.title')}</h2>

      <div className="space-y-1.5">
        <Label htmlFor="group-name">{t('plans.settings.name')}</Label>
        <Input
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2.5">
        {toggles.map((item) => (
          <label
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5 text-sm"
          >
            <span>{item.label}</span>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => item.set(e.target.checked)}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t('plans.settings.saving') : t('plans.settings.save')}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => void onDelete()}
        >
          {t('plans.deletePlan')}
        </Button>
      </div>
    </form>
  );
}

export default PlanSettingsForm;
