'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useLookupCommissionsByEmail,
  type CommissionAccessMatchDto,
} from '@hatohui/models';
import { queueOrderPath } from '@/constants/queue';
import { usePasscodeError } from './usePasscodeError';

export function useCommissionAccessLookup(
  artistId: string,
  onLocked: (match: CommissionAccessMatchDto) => void,
) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const lookup = useLookupCommissionsByEmail();
  const errorMessage = usePasscodeError();

  const openMatch = (match: CommissionAccessMatchDto) => {
    if (match.accessCode) router.push(queueOrderPath(match.accessCode));
    else onLocked(match);
  };

  const search = async () => {
    const result = await lookup
      .mutateAsync({ data: { artistId, email: email.trim() } })
      .catch(() => null);
    const matches = result?.data ?? [];
    if (matches.length === 1) openMatch(matches[0]);
  };

  return {
    email,
    setEmail,
    canSearch: Boolean(email.trim()),
    search,
    isSearching: lookup.isPending,
    matches: lookup.data?.data ?? [],
    hasNoMatches: lookup.isSuccess && lookup.data.data.length === 0,
    openMatch,
    error: errorMessage(lookup.error),
    code,
    setCode,
    openCode: () => {
      if (code.trim()) router.push(queueOrderPath(code.trim()));
    },
  };
}
