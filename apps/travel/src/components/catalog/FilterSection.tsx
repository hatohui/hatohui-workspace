import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

function FilterSection({ title, children }: Props) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default FilterSection;
