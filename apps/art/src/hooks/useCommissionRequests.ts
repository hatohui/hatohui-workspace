'use client';

import { useState } from 'react';
import type { CommissionDto } from '@hatohui/models';
import {
  COMMISSION_TABLE_COLUMNS,
  type CommissionListView,
} from '@/constants/commission';
import { useCommissionsList } from './useCommissionsList';
import { useCommissionFormatters } from './useCommissionFormatters';

export interface CommissionRequestRow {
  id: string;
  clientId: string;
  submitted: string;
  clientName: string;
  clientEmail: string;
  type: string;
  deadline: string;
  price: string;
  status: CommissionDto['status'];
}

export function useCommissionRequests(view: CommissionListView) {
  const list = useCommissionsList(view);
  const format = useCommissionFormatters();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  const rows: CommissionRequestRow[] = list.items.map((item) => ({
    id: item.id,
    clientId: item.clientId,
    submitted: format.dateTime(item.createdAt),
    clientName: item.clientName,
    clientEmail: item.clientEmail,
    type: format.type(item.commissionTypeKey, item.commissionTypeLabel),
    deadline: format.date(item.deadline),
    price: format.money(item.quote, item.currency),
    status: item.status,
  }));

  return {
    ...list,
    rows,
    columns: COMMISSION_TABLE_COLUMNS[view],
    selectedId,
    select: setSelectedId,
    clientId,
    openClient: setClientId,
  };
}
