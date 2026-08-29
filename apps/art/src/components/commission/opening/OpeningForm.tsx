'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { CheckCircle2 } from 'lucide-react';
import {
  Button,
  DateTimeField,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@hatohui/ui';
import type {
  CommissionOpeningDto,
  UpsertCommissionOpeningDto,
} from '@hatohui/models';
import { OPENING_SAVED_FLASH_MS } from '@/constants/commission';

type EndMode = UpsertCommissionOpeningDto['endMode'];

const END_MODES: EndMode[] = ['MANUAL', 'SLOT_CAP', 'INDEFINITE'];

const CLIENT_TIMEZONE =
  typeof window === 'undefined'
    ? ''
    : Intl.DateTimeFormat().resolvedOptions().timeZone;
const noopSubscribe = () => () => {};

function isPast(localDateTime: string): boolean {
  return (
    localDateTime !== '' &&
    new Date(localDateTime).getTime() < Date.now() - 60_000
  );
}

export function OpeningForm({
  initial,
  onSubmit,
}: {
  initial?: CommissionOpeningDto;
  onSubmit: (dto: UpsertCommissionOpeningDto) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const slotCapRef = useRef<HTMLInputElement>(null);

  const [endMode, setEndMode] = useState<EndMode>(initial?.endMode ?? 'MANUAL');
  const [slotCap, setSlotCap] = useState(
    initial?.slotCap != null ? String(initial.slotCap) : '',
  );
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : '',
  );
  const [postTitle, setPostTitle] = useState(initial?.postTitle ?? '');

  const [showErrors, setShowErrors] = useState(false);
  const [scheduledIsPast, setScheduledIsPast] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const tz = useSyncExternalStore(
    noopSubscribe,
    () => CLIENT_TIMEZONE,
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

  async function handleSubmit() {
    const past = !initial && isPast(scheduledAt);
    setScheduledIsPast(past);
    if (slotCapError || past) {
      setShowErrors(true);
      if (slotCapError) {
        slotCapRef.current?.focus();
      } else {
        document.getElementById('scheduled-at')?.focus();
      }
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        endMode,
        slotCap: endMode === 'SLOT_CAP' ? Number(slotCap) : undefined,
        scheduledAt: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : undefined,
        postTitle: postTitle.trim() || undefined,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), OPENING_SAVED_FLASH_MS);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="end-mode">
          {t('commission.admin.opening.endMode')}
        </Label>
        <Select
          value={endMode}
          onValueChange={(value) => setEndMode(value as EndMode)}
        >
          <SelectTrigger id="end-mode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {END_MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {t(`commission.admin.opening.endModeOption.${mode}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t(`commission.admin.opening.endModeHint.${endMode}`)}
        </p>
      </div>

      {endMode === 'SLOT_CAP' && (
        <div className="space-y-1.5">
          <Label htmlFor="slot-cap" required>
            {t('commission.admin.opening.slotCap')}
          </Label>
          <Input
            id="slot-cap"
            ref={slotCapRef}
            type="number"
            inputMode="numeric"
            min={1}
            required
            aria-required
            value={slotCap}
            aria-invalid={showErrors && slotCapError ? true : undefined}
            onBlur={() => setShowErrors(true)}
            onChange={(event) => setSlotCap(event.target.value)}
          />
          {showErrors && slotCapError ? (
            <p className="text-xs text-destructive" role="alert">
              {slotCapError}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('commission.admin.opening.slotCapHint')}
            </p>
          )}
        </div>
      )}

      {!initial && (
        <div className="space-y-1.5">
          <Label htmlFor="scheduled-at">
            {t('commission.admin.opening.scheduledAt')}
          </Label>
          <DateTimeField
            id="scheduled-at"
            value={scheduledAt}
            invalid={showErrors && Boolean(scheduledError)}
            clearLabel={t('commission.admin.opening.clear')}
            onChange={(next) => {
              setScheduledAt(next);
              setScheduledIsPast(isPast(next));
            }}
          />
          {showErrors && scheduledError ? (
            <p className="text-xs text-destructive" role="alert">
              {scheduledError}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {tz
                ? t('commission.admin.opening.scheduledAtTimezoneHint', {
                    timezone: tz,
                  })
                : t('commission.admin.opening.scheduledAtHint')}
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="post-title">
          {t('commission.admin.opening.postTitle')}
        </Label>
        <Input
          id="post-title"
          value={postTitle}
          placeholder={t('commission.admin.opening.postTitlePlaceholder')}
          onChange={(event) => setPostTitle(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {t('commission.admin.opening.postTitleHint')}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button disabled={busy} onClick={() => void handleSubmit()}>
          {busy && <Spinner className="size-4" />}
          {submitLabel}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-primary" aria-hidden />
            {t('commission.admin.opening.saved')}
          </span>
        )}
      </div>
    </div>
  );
}
