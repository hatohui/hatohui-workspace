import { useTranslation } from '@hatohui/i18n';
import { GoogleIcon, useAuth, useGoogleIdentity } from '@hatohui/libs';
import { useNavItems } from '../../hooks/useNavItems';
import MobileNavItem from './MobileNavItem';
import NavSlotPlaceholder from './NavSlotPlaceholder';

interface Props {
  onSettingsClick: () => void;
}

function MobileTabBar({ onSettingsClick }: Props) {
  const { t } = useTranslation();
  const { user, isLoading, logout } = useAuth();
  const { isReady, promptLogin } = useGoogleIdentity();
  const navItems = useNavItems();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card px-1 py-1 shadow-[0_-1px_3px_rgba(20,20,19,0.08)] sm:hidden"
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
    >
      {navItems.map((item) => (
        <MobileNavItem key={item.to} {...item} />
      ))}
      <MobileNavItem
        label={t('navigation.settings')}
        icon="settings"
        onClick={onSettingsClick}
      />
      {isLoading ? (
        <NavSlotPlaceholder className="size-10" />
      ) : user ? (
        <MobileNavItem
          label={t('navigation.logout')}
          icon="logout"
          onClick={() => void logout()}
        />
      ) : (
        <button
          type="button"
          aria-label={t('common:auth.login')}
          disabled={!isReady}
          onClick={promptLogin}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <GoogleIcon />
        </button>
      )}
    </nav>
  );
}

export default MobileTabBar;
