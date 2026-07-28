'use client';

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '../../lib/utils';
import { buttonVariants } from './button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'dropdown',
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center items-center h-9 gap-1.5',
        caption_label: 'text-sm font-medium',
        dropdowns: 'flex items-center gap-1.5 text-sm font-medium',
        dropdown_root:
          'relative rounded-md border border-input has-focus:ring-[3px] has-focus:ring-ring/50',
        dropdown: 'absolute inset-0 opacity-0',
        nav: 'flex items-center justify-between absolute inset-x-0 top-0 h-9',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-70 hover:opacity-100',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-70 hover:opacity-100',
        ),
        month_grid: 'w-full border-collapse mt-2',
        weekdays: 'flex',
        weekday:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        week: 'flex w-full mt-1',
        day: 'relative p-0 text-center text-sm size-8 focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 p-0 font-normal aria-selected:opacity-100',
        ),
        range_start: 'rounded-l-md',
        range_end: 'rounded-r-md',
        selected:
          'bg-primary text-primary-foreground rounded-md hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground [&>button]:bg-primary [&>button]:text-primary-foreground',
        today: cn('bg-accent text-accent-foreground rounded-md'),
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) => {
          const Icon =
            orientation === 'left' ? ChevronLeftIcon : ChevronRightIcon;
          return <Icon className="size-4" {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
