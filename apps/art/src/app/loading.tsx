'use client';

import { Skeleton } from '@hatohui/ui';

export default function Loading() {
  return (
    <main aria-busy className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="aspect-square" />
        ))}
      </div>
    </main>
  );
}
