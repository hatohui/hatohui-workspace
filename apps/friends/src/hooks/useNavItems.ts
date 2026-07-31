import { useLocation } from 'react-router';
import { useAuth } from '@hatohui/libs';
import { useTranslation } from '@hatohui/i18n';
import routes from '../constants/routes';
import type { NavIconKey } from '../constants/navIcons';

export interface NavLinkItem {
  to: string;
  label: string;
  icon: NavIconKey;
  active: boolean;
}

export function useNavItems(): NavLinkItem[] {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const items: NavLinkItem[] = [
    {
      to: routes.dashboard,
      label: user ? t('navigation.dashboard') : t('navigation.home'),
      icon: user ? 'cake' : 'home',
      active: isActive(routes.dashboard),
    },
  ];

  if (!user) {
    items.push({
      to: routes.birthdays,
      label: t('navigation.dashboard'),
      icon: 'cake',
      active: isActive(routes.birthdays),
    });
  }

  if (user) {
    items.push({
      to: routes.newFriend,
      label: t('navigation.addFriend'),
      icon: 'userPlus',
      active: isActive(routes.newFriend),
    });
  }

  return items;
}
