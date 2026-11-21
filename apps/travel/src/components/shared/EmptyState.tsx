import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  message: string;
  action?: ReactNode;
}

function EmptyState({ icon: Icon, message, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <Icon className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}

export default EmptyState;
