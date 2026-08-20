import { useTranslation } from '@hatohui/i18n';
import { Input } from '@hatohui/ui';
import type { AdminListUsersOnboardingStatus } from '@hatohui/models';
import { ADMIN_ONBOARDING_STATUSES } from '../../constants/admin';

interface UsersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onboardingStatus: AdminListUsersOnboardingStatus | undefined;
  onOnboardingStatusChange: (
    value: AdminListUsersOnboardingStatus | undefined,
  ) => void;
}

function UsersFilters({
  search,
  onSearchChange,
  onboardingStatus,
  onOnboardingStatusChange,
}: UsersFiltersProps) {
  const { t } = useTranslation('workspace');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t('users.searchPlaceholder')}
        className="w-64"
      />
      <select
        value={onboardingStatus ?? ''}
        onChange={(e) =>
          onOnboardingStatusChange(
            (e.target.value || undefined) as
              AdminListUsersOnboardingStatus | undefined,
          )
        }
        className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
      >
        <option value="">{t('users.allStatuses')}</option>
        {ADMIN_ONBOARDING_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}

export default UsersFilters;
