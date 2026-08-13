import { useState, type FormEvent } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Checkbox, Input, Label } from '@hatohui/ui';
import type { CreateFriendDto, FriendDto } from '@hatohui/models';
import type { Visibility } from '../constants/visibility';
import { getErrorCategory } from '@hatohui/libs';
import { useSocialMediaFields } from '../hooks/useSocialMediaFields';
import { useStagedAvatar } from '../hooks/useStagedAvatar';
import SocialMediaFieldList from './SocialMediaFieldList';
import BirthdayFields from './BirthdayFields';
import FriendAvatarField from './FriendAvatarField';
import AvatarHistoryGallery from './AvatarHistoryGallery';
import VisibilityField from './VisibilityField';

type Props = {
  title: string;
  submitLabel: string;
  initialFriend?: FriendDto;
  submitting: boolean;
  error?: unknown;
  onSubmit: (dto: CreateFriendDto) => void;
};

function FriendForm({
  title,
  submitLabel,
  initialFriend,
  submitting,
  error,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialFriend?.name ?? '');
  const avatar = useStagedAvatar(initialFriend?.avatarUrl ?? null);
  const [birthYear, setBirthYear] = useState(
    initialFriend?.birthYear?.toString() ?? '',
  );
  const [birthMonth, setBirthMonth] = useState(
    initialFriend?.birthMonth?.toString() ?? '',
  );
  const [birthDay, setBirthDay] = useState(
    initialFriend?.birthDay?.toString() ?? '',
  );
  const [preferAnonymous, setPreferAnonymous] = useState(
    initialFriend?.preferAnonymous ?? true,
  );
  const [visibility, setVisibility] = useState<Visibility>(
    initialFriend?.visibility ?? 'PUBLIC',
  );
  const socialFields = useSocialMediaFields(
    (initialFriend?.socialMedias as Record<string, string> | null) ?? {},
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let avatarKey: string | undefined;
    try {
      avatarKey = await avatar.commit();
    } catch {
      return;
    }
    onSubmit({
      name,
      birthYear: birthYear ? Number(birthYear) : undefined,
      birthMonth: birthMonth ? Number(birthMonth) : undefined,
      birthDay: birthDay ? Number(birthDay) : undefined,
      preferAnonymous,
      visibility,
      socialMedias: socialFields.toSocialMedias(),
      avatarKey,
    });
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-5"
    >
      <h1 className="text-3xl">{title}</h1>
      <FriendAvatarField
        alt={name || t('friendForm.nameLabel')}
        previewUrl={avatar.previewUrl}
        isBusy={avatar.isBusy}
        error={avatar.error}
        onFileSelected={(file) => void avatar.stageFile(file)}
      />
      {initialFriend && (
        <AvatarHistoryGallery
          friendId={initialFriend.id}
          onRestored={avatar.setRestoredPreview}
        />
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t('friendForm.nameLabel')}</Label>
        <Input
          id="name"
          required
          value={name}
          placeholder={t('friendForm.namePlaceholder')}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <BirthdayFields
        birthYear={birthYear}
        birthMonth={birthMonth}
        birthDay={birthDay}
        onBirthYearChange={setBirthYear}
        onBirthMonthChange={setBirthMonth}
        onBirthDayChange={setBirthDay}
      />
      <div className="flex items-center gap-2">
        <Checkbox
          id="preferAnonymous"
          checked={preferAnonymous}
          onCheckedChange={(checked) => setPreferAnonymous(checked === true)}
        />
        <Label htmlFor="preferAnonymous">
          {t('friendForm.preferAnonymousLabel')}
        </Label>
      </div>
      <VisibilityField value={visibility} onChange={setVisibility} />
      <SocialMediaFieldList
        rows={socialFields.rows}
        onAdd={socialFields.addRow}
        onRemove={socialFields.removeRow}
        onUpdate={socialFields.updateRow}
      />
      {error != null && (
        <p role="alert" className="text-sm text-destructive">
          {t(`common:errors.${getErrorCategory(error)}`)}
        </p>
      )}
      <Button
        type="submit"
        disabled={submitting || avatar.isBusy}
        className="w-fit"
      >
        {submitLabel}
      </Button>
    </form>
  );
}

export default FriendForm;
