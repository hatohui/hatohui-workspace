import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { ThemeSelect, useAuth } from '@hatohui/libs';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@hatohui/ui';
import { Settings, SlidersHorizontal, TableProperties } from 'lucide-react';
import routes from '../../constants/routes';
import { useCanEdit } from '../../hooks/useCanEdit';
import LanguageSelect from './LanguageSelect';
import QuickMenuLink from './QuickMenuLink';

function QuickMenu() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = useCanEdit();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={t('nav.quickMenu')}
          title={t('nav.quickMenu')}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3 p-2">
        {(user || canEdit) && (
          <div className="space-y-0.5 border-b border-border/60 pb-2">
            {canEdit && (
              <QuickMenuLink
                to={routes.admin}
                label={t('nav.admin')}
                icon={TableProperties}
                onNavigate={close}
              />
            )}
            {user && (
              <QuickMenuLink
                to={routes.settings}
                label={t('nav.settings')}
                icon={Settings}
                onNavigate={close}
              />
            )}
          </div>
        )}
        <div className="space-y-1.5 px-1">
          <p className="text-xs font-medium text-muted-foreground">
            {t('common:theme.label')}
          </p>
          <ThemeSelect />
        </div>
        <div className="space-y-1.5 px-1 pb-1">
          <p className="text-xs font-medium text-muted-foreground">
            {t('common:language.title')}
          </p>
          <LanguageSelect />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default QuickMenu;
