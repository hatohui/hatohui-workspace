import { useTranslation } from '@hatohui/i18n';
import { Button, cn } from '@hatohui/ui';
import { themeIcons } from './themeIcons';
import { useTheme } from './useTheme';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { t } = useTranslation('common');
  const { mode, cycleMode } = useTheme();
  const Icon = themeIcons[mode];
  const label = t('theme.toggle', { mode: t(`theme.modes.${mode}`) });

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? 'sm' : 'icon'}
      onClick={cycleMode}
      aria-label={label}
      title={label}
      className={cn('rounded-full', className)}
    >
      <Icon className="size-4 shrink-0" />
      {showLabel && <span className="text-sm">{t(`theme.modes.${mode}`)}</span>}
    </Button>
  );
}
