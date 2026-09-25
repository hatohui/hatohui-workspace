'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import {
  getArtistDashboardQueryKey,
  getCommissionQueryKey,
  getCommissionsQueryKey,
  useSendCommissionQuote,
} from '@hatohui/models';
import { useCommissionFormatters } from './useCommissionFormatters';

export interface QuoteTarget {
  id: string;
  clientName: string;
  currency: string;
  quote: number | null;
  estimateLow: number | null;
  estimateHigh: number | null;
}

export type QuoteMode = 'quote' | 'accept';

const toMajor = (cents: number | null) =>
  cents == null ? '' : String(cents / 100);
const toCents = (value: string) => Math.round(Number(value) * 100);

export function useQuoteDialog() {
  const { t } = useTranslation('art');
  const toast = useToast();
  const format = useCommissionFormatters();
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<QuoteTarget | null>(null);
  const [mode, setMode] = useState<QuoteMode>('quote');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const mutation = useSendCommissionQuote({
    mutation: {
      onSuccess: (_data, { data }) =>
        toast.success(
          t('app.quotes.sent', { context: data.accept ? 'accept' : 'quote' }),
        ),
      onError: () => toast.error(t('app.quotes.failed')),
      onSettled: (_data, _error, { id }) => {
        void queryClient.invalidateQueries({
          queryKey: getCommissionsQueryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: getCommissionQueryKey(id),
        });
        void queryClient.invalidateQueries({
          queryKey: getArtistDashboardQueryKey(),
        });
      },
    },
  });

  const open = (next: QuoteTarget, nextMode: QuoteMode) => {
    setTarget(next);
    setMode(nextMode);
    setAmount(toMajor(next.quote ?? next.estimateLow));
    setMessage('');
  };

  const isValid = amount.trim() !== '' && Number(amount) >= 0;

  return {
    target,
    mode,
    isOpen: target !== null,
    close: () => setTarget(null),
    open,
    amount,
    setAmount,
    message,
    setMessage,
    isValid,
    estimate: target
      ? format.range(target.estimateLow, target.estimateHigh, target.currency)
      : null,
    submit: () => {
      if (!target || !isValid) return;
      mutation.mutate({
        id: target.id,
        data: {
          amount: toCents(amount),
          message: message.trim() || undefined,
          accept: mode === 'accept',
        },
      });
      setTarget(null);
    },
  };
}
