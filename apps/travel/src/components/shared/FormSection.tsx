import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

function FormSection({ title, children }: Props) {
  return (
    <section className="space-y-4 border-t border-border/60 pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default FormSection;
