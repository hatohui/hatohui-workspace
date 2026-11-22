import { NavLink } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { TableProperties } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navItems';
import routes from '../../constants/routes';
import { useCanEdit } from '../../hooks/useCanEdit';

function MobileBottomNav() {
  const { t } = useTranslation();
  const canEdit = useCanEdit();
  const items = canEdit
    ? [
        ...NAV_ITEMS,
        { to: routes.admin, labelKey: 'admin.title', icon: TableProperties },
      ]
    : NAV_ITEMS;

  return (
    <nav
      aria-label={t('brand')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div
        className={cn(
          'mx-auto grid max-w-lg px-2 py-1',
          canEdit ? 'grid-cols-4' : 'grid-cols-3',
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'flex min-h-13 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="truncate">{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
