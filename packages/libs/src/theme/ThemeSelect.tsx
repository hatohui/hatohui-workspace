import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { THEME_MODES } from './themeConstants';
import { themeIcons } from './themeIcons';
import { useTheme } from './useTheme';

export function ThemeSelect({ className }: { className?: string }) {
  const { t } = useTranslation('common');
  const { mode, setMode } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label={t('theme.label')}
      className={cn(
        'grid w-full grid-cols-3 gap-1 rounded-lg border border-border bg-muted p-1',
        className,
      )}
    >
      {THEME_MODES.map((option) => {
        const Icon = themeIcons[option];
        const selected = option === mode;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setMode(option)}
            className={cn(
              'flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
              selected && 'bg-background text-foreground shadow-soft',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {t(`theme.modes.${option}`)}
          </button>
        );
      })}
    </div>
  );
}
