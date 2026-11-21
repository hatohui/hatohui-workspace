import { Search } from 'lucide-react';
import { Input } from '@hatohui/ui';

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

function SearchField({ value, placeholder, onChange }: Props) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-full pl-9 sm:h-10"
      />
    </div>
  );
}

export default SearchField;
