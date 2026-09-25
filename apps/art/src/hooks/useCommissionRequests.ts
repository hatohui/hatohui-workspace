'use client';

import { useState } from 'react';
import type { CommissionDto } from '@hatohui/models';
import { useCommissionsList } from './useCommissionsList';
import { useCommissionFormatters } from './useCommissionFormatters';

export interface CommissionRequestRow {
  id: string;
  submitted: string;
  clientName: string;
  clientEmail: string;
  type: string;
  deadline: string;
  quote: string;
  status: CommissionDto['status'];
}

export function useCommissionRequests() {
  const list = useCommissionsList();
  const format = useCommissionFormatters();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows: CommissionRequestRow[] = list.items.map((item) => ({
    id: item.id,
    submitted: format.date(item.createdAt),
    clientName: item.clientName,
    clientEmail: item.clientEmail,
    type: format.type(item.commissionTypeKey),
    deadline: format.date(item.deadline),
    quote: format.money(item.quote, item.currency),
    status: item.status,
  }));

  return { ...list, rows, selectedId, select: setSelectedId };
}
