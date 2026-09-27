'use client';

import { useQuery } from '@tanstack/react-query';
import {
  matchCommissionIdentity,
  type CommissionIdentityDto,
  type MatchCommissionIdentityDto,
} from '@hatohui/models';
import { useDebouncedValue } from '@hatohui/libs';
import {
  EMAIL_REGEX,
  IDENTITY_MATCH_DEBOUNCE_MS,
  IDENTITY_MATCH_QUERY_KEY,
} from '@/constants/commission';

function toMatchQuery(
  name: string,
  handle: string,
  email: string,
): MatchCommissionIdentityDto {
  return {
    name: name.trim() || undefined,
    handle: handle.trim() || undefined,
    email: EMAIL_REGEX.test(email.trim()) ? email.trim() : undefined,
  };
}

export function useIdentityMatch({
  name,
  handle,
  email,
  enabled,
  declinedProfileIds,
}: {
  name: string;
  handle: string;
  email: string;
  enabled: boolean;
  declinedProfileIds: string[];
}): CommissionIdentityDto | null {
  const debouncedKey = useDebouncedValue(
    JSON.stringify(toMatchQuery(name, handle, email)),
    IDENTITY_MATCH_DEBOUNCE_MS,
  );
  const query = JSON.parse(debouncedKey) as MatchCommissionIdentityDto;
  const hasInput = Boolean(query.name || query.handle || query.email);

  const { data } = useQuery({
    queryKey: [IDENTITY_MATCH_QUERY_KEY, debouncedKey],
    queryFn: () => matchCommissionIdentity(query),
    enabled: enabled && hasInput,
    retry: false,
  });

  const candidates = enabled && hasInput ? (data?.data ?? []) : [];
  return (
    candidates.find(
      (candidate) => !declinedProfileIds.includes(candidate.profileId),
    ) ?? null
  );
}
