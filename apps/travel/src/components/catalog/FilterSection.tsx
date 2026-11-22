import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

function FilterSection({ title, children }: Props) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default FilterSection;
