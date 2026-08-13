import { useState, type FormEvent } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import type { CreateFriendDto, FriendDto } from '@hatohui/models';
import {
  getErrorCategory,
  useStagedAvatar,
  BirthdayFields,
  FriendAvatarField,
  VisibilityField,
  type Visibility,
} from '@hatohui/libs';
import { useSocialMediaFields } from '../hooks/useSocialMediaFields';
import SocialMediaFieldList from './SocialMediaFieldList';
import AvatarHistoryGallery from './AvatarHistoryGallery';

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
