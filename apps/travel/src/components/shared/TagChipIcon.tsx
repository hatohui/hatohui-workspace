import type { LucideIcon } from 'lucide-react';

function TagChipIcon({ icon: Icon }: { icon: LucideIcon | undefined }) {
  if (!Icon) return null;
  return <Icon className="size-3.5 shrink-0" aria-hidden />;
}

export default TagChipIcon;
