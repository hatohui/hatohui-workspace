'use client';

import type { CommissionPublicDetailDto } from '@hatohui/models';
import { useClientPreferences } from '@/hooks/useClientPreferences';
import { OrderQueueVisibilityCard } from './OrderQueueVisibilityCard';
import { OrderContactCard } from './OrderContactCard';
import { OrderPasscodeCard } from './OrderPasscodeCard';

export function OrderSettings({
  code,
  commission,
}: {
  code: string;
  commission: CommissionPublicDetailDto;
}) {
  const preferences = useClientPreferences(code, commission);

  return (
    <div className="space-y-3">
      <OrderQueueVisibilityCard preferences={preferences} />
      {commission.canSetPasscode && (
        <OrderPasscodeCard code={code} source={commission.passcodeSource} />
      )}
      <OrderContactCard preferences={preferences} />
    </div>
  );
}
