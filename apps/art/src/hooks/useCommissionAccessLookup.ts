'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLookupCommissionsByPasscode } from '@hatohui/models';
import { queueOrderPath } from '@/constants/queue';
import { usePasscodeError } from './usePasscodeError';

export function useCommissionAccessLookup(artistId: string) {
  const router = useRouter();
  const { artist } = useParams<{ artist: string }>();
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [code, setCode] = useState('');
  const lookup = useLookupCommissionsByPasscode();
  const errorMessage = usePasscodeError();

  const search = async () => {
    const result = await lookup
      .mutateAsync({ data: { artistId, email: email.trim(), passcode } })
      .catch(() => null);
    const matches = result?.data ?? [];
    if (matches.length === 1)
      router.push(queueOrderPath(artist, matches[0].accessCode));
  };

  return {
    email,
    setEmail,
    passcode,
    setPasscode,
    canSearch: Boolean(email.trim() && passcode.trim()),
    search,
    isSearching: lookup.isPending,
    matches: lookup.data?.data ?? [],
    error: errorMessage(lookup.error),
    code,
    setCode,
    openCode: () => {
      if (code.trim()) router.push(queueOrderPath(artist, code.trim()));
    },
    orderHref: (accessCode: string) => queueOrderPath(artist, accessCode),
  };
}
