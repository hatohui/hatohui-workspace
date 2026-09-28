'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getLookupCommissionByCodeQueryKey,
  useSetClientCommissionPasscode,
} from '@hatohui/models';
import { PASSCODE_MIN_LENGTH } from '@/constants/queue';
import { usePasscodeError } from './usePasscodeError';

export function useClientPasscode(code: string) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [passcode, setPasscode] = useState('');
  const errorMessage = usePasscodeError();
  const save = useSetClientCommissionPasscode({
    mutation: {
      onSuccess: () => {
        setIsEditing(false);
        setPasscode('');
        return queryClient.invalidateQueries({
          queryKey: getLookupCommissionByCodeQueryKey(code),
        });
      },
    },
  });

  return {
    isEditing,
    startEditing: () => {
      save.reset();
      setIsEditing(true);
    },
    cancel: () => setIsEditing(false),
    passcode,
    setPasscode,
    canSave: passcode.trim().length >= PASSCODE_MIN_LENGTH,
    submit: () => save.mutate({ code, data: { passcode } }),
    isSaving: save.isPending,
    justSaved: save.isSuccess,
    error: save.isError ? errorMessage(save.error) : null,
  };
}
