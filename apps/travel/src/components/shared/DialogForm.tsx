import type { FormEvent, ReactNode } from 'react';
import { DialogHeader, DialogTitle } from '@hatohui/ui';
import FormActions from './FormActions';

interface Props {
  title: string;
  onSubmit: (event: FormEvent) => void;
  canSubmit: boolean;
  isSaving: boolean;
  onCancel: () => void;
  children: ReactNode;
}

function DialogForm(props: Props) {
  return (
    <>
      <DialogHeader className="border-b border-border/60 px-6 py-4 pr-12">
        <DialogTitle>{props.title}</DialogTitle>
      </DialogHeader>
      <form onSubmit={props.onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {props.children}
        </div>
        <FormActions
          canSubmit={props.canSubmit}
          isSaving={props.isSaving}
          onCancel={props.onCancel}
        />
      </form>
    </>
  );
}

export default DialogForm;
