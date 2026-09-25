'use client';

import { useState, useSyncExternalStore } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type {
  CommissionOpeningDto,
  UpsertCommissionOpeningDto,
} from '@hatohui/models';
import { OPENING_SAVED_FLASH_MS } from '@/constants/commission';

export type OpeningEndMode = UpsertCommissionOpeningDto['endMode'];

const PAST_GRACE_MS = 60_000;
const noopSubscribe = () => () => {};
const clientTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

function isPast(localDateTime: string): boolean {
  return (
    localDateTime !== '' &&
    new Date(localDateTime).getTime() < Date.now() - PAST_GRACE_MS
  );
}

export function useOpeningForm(
  initial: CommissionOpeningDto | undefined,
  onSubmit: (dto: UpsertCommissionOpeningDto) => Promise<unknown>,
) {
  const { t } = useTranslation('art');

  const [endMode, setEndMode] = useState<OpeningEndMode>(
    initial?.endMode ?? 'MANUAL',
  );
  const [slotCap, setSlotCap] = useState(
    initial?.slotCap != null ? String(initial.slotCap) : '',
  );
  const [scheduledAt, setScheduledAtState] = useState(
    initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : '',
  );
  const [postTitle, setPostTitle] = useState(initial?.postTitle ?? '');
  const [showErrors, setShowErrors] = useState(false);
  const [scheduledIsPast, setScheduledIsPast] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const timezone = useSyncExternalStore(
    noopSubscribe,
    clientTimezone,
    () => '',
  );

  const slotCapError =
    endMode === 'SLOT_CAP' && !(Number(slotCap) > 0)
      ? t('commission.admin.opening.slotCapError')
      : null;
  const scheduledError =
    !initial && scheduledIsPast
      ? t('commission.admin.opening.scheduledAtPastError')
      : null;

  const submitLabel = initial
    ? t('commission.admin.opening.saveChanges')
    : scheduledAt
      ? t('commission.admin.opening.saveScheduled')
      : t('commission.admin.opening.saveNew');

  const setScheduledAt = (next: string) => {
    setScheduledAtState(next);
    setScheduledIsPast(isPast(next));
  };

  const submit = async () => {
    const past = !initial && isPast(scheduledAt);
    setScheduledIsPast(past);
    if (slotCapError || past) {
      setShowErrors(true);
      if (slotCapError) document.getElementById('slot-cap')?.focus();
      else document.getElementById('scheduled-at')?.focus();
      return;
    }
    setIsBusy(true);
    try {
      await onSubmit({
        endMode,
        slotCap: endMode === 'SLOT_CAP' ? Number(slotCap) : undefined,
        scheduledAt: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : undefined,
        postTitle: postTitle.trim() || undefined,
      });
      setIsSaved(true);
      window.setTimeout(() => setIsSaved(false), OPENING_SAVED_FLASH_MS);
    } finally {
      setIsBusy(false);
    }
  };

  return {
    isNew: !initial,
    endMode,
    setEndMode,
    slotCap,
    setSlotCap,
    slotCapError: showErrors ? slotCapError : null,
    revealErrors: () => setShowErrors(true),
    scheduledAt,
    setScheduledAt,
    scheduledError: showErrors ? scheduledError : null,
    timezone,
    postTitle,
    setPostTitle,
    submitLabel,
    isBusy,
    isSaved,
    submit: () => void submit(),
  };
}
