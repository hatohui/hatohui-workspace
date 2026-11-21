import type { ReactNode } from 'react';
import { Dialog, DialogContent, cn } from '@hatohui/ui';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wide?: boolean;
  children: ReactNode;
}

function FormDialog({ open, onOpenChange, wide = false, children }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0',
          wide ? 'sm:max-w-xl lg:max-w-5xl' : 'sm:max-w-lg',
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default FormDialog;
