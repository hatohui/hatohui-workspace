'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getLookupCommissionByCodeQueryKey,
  useSocialPlatforms,
  useUpdateClientCommissionPreferences,
  type CommissionPublicDetailDto,
} from '@hatohui/models';
import { EMAIL_CONTACT_PLATFORM } from '@/constants/commission';

export function useClientPreferences(
  code: string,
  commission: CommissionPublicDetailDto,
) {
  const queryClient = useQueryClient();
  const { data: platformData } = useSocialPlatforms();
  const savedPlatform = commission.contactPlatform ?? EMAIL_CONTACT_PLATFORM;
  const savedValue = commission.contactValue ?? '';
  const [platform, setPlatform] = useState(savedPlatform);
  const [value, setValue] = useState(savedValue);
  const [justSaved, setJustSaved] = useState(false);

  const update = useUpdateClientCommissionPreferences({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: getLookupCommissionByCodeQueryKey(code),
        }),
    },
  });

  const needsValue = platform !== EMAIL_CONTACT_PLATFORM;
  const isContactChanged =
    platform !== savedPlatform || (needsValue && value.trim() !== savedValue);

  return {
    isPublic: !commission.isHiddenInQueue,
    setPublic: (isPublic: boolean) =>
      update.mutate({ code, data: { isHiddenInQueue: !isPublic } }),
    platforms: (platformData?.data ?? []).map((item) => item.name),
    platform,
    setPlatform: (next: string) => {
      setJustSaved(false);
      setPlatform(next);
    },
    value,
    setValue: (next: string) => {
      setJustSaved(false);
      setValue(next);
    },
    needsValue,
    canSaveContact: isContactChanged && (!needsValue || Boolean(value.trim())),
    saveContact: () =>
      update.mutate(
        { code, data: { contactPlatform: platform, contactValue: value } },
        { onSuccess: () => setJustSaved(true) },
      ),
    isSaving: update.isPending,
    justSaved,
  };
}
