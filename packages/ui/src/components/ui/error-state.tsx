import { AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

type ErrorStateAction = {
  label: string;
  onClick: () => void;
};

type Props = {
  message: string;
  retry?: ErrorStateAction;
  back?: ErrorStateAction;
  className?: string;
};

function ErrorState({ message, retry, back, className }: Props) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-4 py-16 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {(retry || back) && (
        <div className="flex gap-2">
          {retry && (
            <Button variant="outline" onClick={retry.onClick}>
              {retry.label}
            </Button>
          )}
          {back && (
            <Button variant="ghost" onClick={back.onClick}>
              {back.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export { ErrorState };
