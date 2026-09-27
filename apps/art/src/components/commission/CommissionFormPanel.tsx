import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@hatohui/ui';

export function CommissionFormPanel({
  icon: Icon,
  title,
  description,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-background p-5 shadow-sm',
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-medium leading-8">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}
