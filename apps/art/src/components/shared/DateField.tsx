'use client';

import { CalendarIcon, X } from 'lucide-react';
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@hatohui/ui';

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplay(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function DateField({
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const selected = parseIsoDate(value);

  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start font-normal"
          >
            <CalendarIcon className="size-4" aria-hidden />
            {selected ? formatDisplay(selected) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="label"
            selected={selected}
            onSelect={(date) => onChange(date ? toIsoDate(date) : '')}
            disabled={{ before: new Date() }}
          />
        </PopoverContent>
      </Popover>
      {selected && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear date"
          onClick={() => onChange('')}
        >
          <X className="size-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}
