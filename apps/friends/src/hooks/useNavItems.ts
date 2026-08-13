import { useLocation } from 'react-router';
import { useAuth } from '@hatohui/libs';
import { useTranslation } from '@hatohui/i18n';
import routes from '../constants/routes';
import type { NavIconKey } from '../constants/navIcons';
import { useUnreadCount } from './useNotifications';

export interface NavLinkItem {
  to: string;
  label: string;
  icon: NavIconKey;
  active: boolean;
  /// Unread count rendered as a pill; 0 renders nothing.
  badge?: number;
}

export function useNavItems(): NavLinkItem[] {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const unreadCount = useUnreadCount();
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
      to: routes.social,
      label: t('navigation.social'),
      icon: 'social',
      active: isActive(routes.social),
    });
    items.push({
      to: routes.notifications,
      label: t('navigation.notifications'),
      icon: 'bell',
      active: isActive(routes.notifications),
      badge: unreadCount,
    });
    items.push({
      to: routes.account,
      label: t('navigation.account'),
      icon: 'user',
      active: isActive(routes.account),
    });
  }

  return items;
}
