'use client';

import { CalendarIcon, X } from 'lucide-react';
import {
  Button,
  Calendar,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@hatohui/ui';
import { useDateInput } from '@/hooks/useDateInput';
import { DATE_INPUT_PLACEHOLDER } from '@/constants/dateInput';

export function DateField({
  id,
  value,
  onChange,
  placeholder = DATE_INPUT_PLACEHOLDER,
  minDate,
  invalid = false,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  invalid?: boolean;
}) {
  const input = useDateInput(value, onChange);

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={placeholder}
            className="absolute top-1/2 left-1 size-7 -translate-y-1/2 text-muted-foreground"
          >
            <CalendarIcon className="size-4" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="label"
            selected={input.selected}
            defaultMonth={input.selected ?? minDate}
            onSelect={input.pick}
            disabled={{ before: minDate ?? new Date() }}
          />
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={input.text}
        aria-invalid={invalid ? true : undefined}
        className="px-9"
        onChange={(event) => input.type(event.target.value)}
        onBlur={input.commit}
      />
      {input.selected && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
          aria-label="Clear date"
          onClick={input.clear}
        >
          <X className="size-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}
