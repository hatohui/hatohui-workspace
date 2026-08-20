import { useTranslation } from '@hatohui/i18n';
import { Button, Input } from '@hatohui/ui';

interface ProfilesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

function ProfilesFilters({ search, onSearchChange }: ProfilesFiltersProps) {
  const { t } = useTranslation('workspace');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t('profiles.searchPlaceholder')}
        className="w-64"
      />
      {search !== '' && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onSearchChange('')}
        >
          {t('users.clearFilters')}
        </Button>
      )}
    </div>
  );
}

export default ProfilesFilters;
