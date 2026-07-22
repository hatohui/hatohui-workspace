import { useState, type FormEvent } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Checkbox, Input, Label } from '@hatohui/ui';
import type { CreateFriendDto, FriendDto } from '@hatohui/models';
import { useSocialMediaFields } from '../hooks/useSocialMediaFields';
import SocialMediaFieldList from './SocialMediaFieldList';
import BirthdayFields from './BirthdayFields';

type Props = {
  title: string;
  submitLabel: string;
  initialFriend?: FriendDto;
  submitting: boolean;
  onSubmit: (dto: CreateFriendDto) => void;
};

function FriendForm({
  title,
  submitLabel,
  initialFriend,
  submitting,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialFriend?.name ?? '');
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
  const socialFields = useSocialMediaFields(
    (initialFriend?.socialMedias as Record<string, string> | null) ?? {},
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      birthYear: birthYear ? Number(birthYear) : undefined,
      birthMonth: birthMonth ? Number(birthMonth) : undefined,
      birthDay: birthDay ? Number(birthDay) : undefined,
      preferAnonymous,
      socialMedias: socialFields.toSocialMedias(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h1 className="text-3xl">{title}</h1>
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
      <SocialMediaFieldList
        rows={socialFields.rows}
        onAdd={socialFields.addRow}
        onRemove={socialFields.removeRow}
        onUpdate={socialFields.updateRow}
      />
      <Button type="submit" disabled={submitting} className="w-fit">
        {submitLabel}
      </Button>
    </form>
  );
}

export default FriendForm;
