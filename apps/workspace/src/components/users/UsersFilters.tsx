import { useTranslation } from '@hatohui/i18n';
import { Input } from '@hatohui/ui';
import type { AdminListUsersOnboardingStatus } from '@hatohui/models';
import {
  ADMIN_ONBOARDING_STATUSES,
  ADMIN_USER_SORT_OPTIONS,
  type AdminSortDirection,
  type AdminUserSortOption,
} from '../../constants/admin';

interface UsersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onboardingStatus: AdminListUsersOnboardingStatus | undefined;
  onOnboardingStatusChange: (
    value: AdminListUsersOnboardingStatus | undefined,
  ) => void;
  sort: AdminUserSortOption;
  onSortChange: (value: AdminUserSortOption) => void;
  direction: AdminSortDirection;
  onDirectionChange: (value: AdminSortDirection) => void;
}

function UsersFilters({
  search,
  onSearchChange,
  onboardingStatus,
  onOnboardingStatusChange,
  sort,
  onSortChange,
  direction,
  onDirectionChange,
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
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as AdminUserSortOption)}
        className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
      >
        {ADMIN_USER_SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(`users.columns.${option}`)}
          </option>
        ))}
      </select>
      <select
        value={direction}
        onChange={(e) =>
          onDirectionChange(e.target.value as AdminSortDirection)
        }
        className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
      >
        <option value="asc">{t('users.ascending')}</option>
        <option value="desc">{t('users.descending')}</option>
      </select>
    </div>
  );
}

export default UsersFilters;
