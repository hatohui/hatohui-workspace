'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  DoorOpen,
} from 'lucide-react';
import {
  Button,
  ConfirmDialog,
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
import { useCommissionOpeningsAdmin } from '@/hooks/useCommissionOpenings';

type EndMode = UpsertCommissionOpeningDto['endMode'];
type Status = CommissionOpeningDto['status'];

const END_MODES: EndMode[] = ['MANUAL', 'SLOT_CAP', 'INDEFINITE'];
const SAVED_FLASH_MS = 2500;

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

function StatusBadge({ status }: { status: Status }) {
  const { t } = useTranslation('art');
  const styles: Record<Status, string> = {
    OPEN: 'bg-primary text-primary-foreground',
    SCHEDULED: 'bg-secondary text-secondary-foreground border border-border',
    CLOSED: 'bg-muted text-muted-foreground',
  };
  const Icon =
    status === 'OPEN'
      ? CircleDot
      : status === 'SCHEDULED'
        ? CalendarClock
        : CircleDashed;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      <Icon className="size-3.5" aria-hidden />
      {t(`commission.admin.opening.status.${status}`)}
    </span>
  );
}

function OpeningForm({
  initial,
  onSubmit,
}: {
  initial?: CommissionOpeningDto;
  onSubmit: (dto: UpsertCommissionOpeningDto) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const slotCapRef = useRef<HTMLInputElement>(null);
  const scheduledAtRef = useRef<HTMLInputElement>(null);

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
      (slotCapError ? slotCapRef : scheduledAtRef).current?.focus();
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
      window.setTimeout(() => setSaved(false), SAVED_FLASH_MS);
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
          <Label htmlFor="slot-cap">
            {t('commission.admin.opening.slotCap')}
          </Label>
          <Input
            id="slot-cap"
            ref={slotCapRef}
            type="number"
            inputMode="numeric"
            min={1}
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
          <div className="flex items-center justify-between">
            <Label htmlFor="scheduled-at">
              {t('commission.admin.opening.scheduledAt')}
            </Label>
            {scheduledAt && (
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                onClick={() => setScheduledAt('')}
              >
                {t('commission.admin.opening.clear')}
              </button>
            )}
          </div>
          <Input
            id="scheduled-at"
            ref={scheduledAtRef}
            type="datetime-local"
            value={scheduledAt}
            aria-invalid={showErrors && scheduledError ? true : undefined}
            onBlur={() => {
              setShowErrors(true);
              setScheduledIsPast(isPast(scheduledAt));
            }}
            onChange={(event) => {
              setScheduledAt(event.target.value);
              setScheduledIsPast(isPast(event.target.value));
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

export function CommissionOpeningPanel() {
  const { t } = useTranslation('art');
  const { items, isLoading, create, update, open, close } =
    useCommissionOpeningsAdmin();
  const [confirmingClose, setConfirmingClose] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  if (isLoading)
    return <p className="text-muted-foreground">{t('common:loading')}</p>;

  const active = items.find(
    (item) => item.status === 'OPEN' || item.status === 'SCHEDULED',
  );
  const history = items.filter((item) => item.id !== active?.id);

  const supporting =
    active?.status === 'SCHEDULED' && active.scheduledAt
      ? t('commission.admin.opening.scheduledFor', {
          date: new Date(active.scheduledAt).toLocaleString(),
        })
      : active?.status === 'OPEN' &&
          active.endMode === 'SLOT_CAP' &&
          active.slotCap != null
        ? t('commission.admin.opening.slotsTaken', {
            taken: active.slotsTaken ?? 0,
            cap: active.slotCap,
          })
        : active?.status === 'OPEN' && active.openedAt
          ? t('commission.admin.opening.openSince', {
              date: new Date(active.openedAt).toLocaleDateString(),
            })
          : null;

  async function runAction(fn: () => Promise<unknown>) {
    setActionBusy(true);
    try {
      await fn();
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <header className="space-y-1">
        <h1 className="font-serif text-2xl">
          {t('commission.admin.opening.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('commission.admin.opening.subtitle')}
        </p>
      </header>

      <section className="rounded-lg border border-border p-6">
        {active ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <StatusBadge status={active.status} />
                {supporting && (
                  <p className="text-sm text-muted-foreground">{supporting}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {active.status === 'SCHEDULED' && (
                  <Button
                    size="sm"
                    disabled={actionBusy}
                    onClick={() => void runAction(() => open(active.id))}
                  >
                    {t('commission.admin.opening.openNow')}
                  </Button>
                )}
                {active.status === 'OPEN' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionBusy}
                    onClick={() => setConfirmingClose(active.id)}
                  >
                    {t('commission.admin.opening.closeNow')}
                  </Button>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                {t('commission.admin.opening.editHeading')}
              </h2>
              <OpeningForm
                key={active.id}
                initial={active}
                onSubmit={(dto) => update({ id: active.id, data: dto })}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <DoorOpen className="size-8 text-muted-foreground" aria-hidden />
              <p className="font-medium">
                {t('commission.admin.opening.emptyTitle')}
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {t('commission.admin.opening.emptyBody')}
              </p>
            </div>
            <div className="border-t border-border pt-6">
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                {t('commission.admin.opening.newHeading')}
              </h2>
              <OpeningForm onSubmit={(dto) => create({ data: dto })} />
            </div>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t('commission.admin.opening.history')}
          </h3>
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-muted-foreground">
                    {t(`commission.admin.opening.endModeShort.${item.endMode}`)}
                    {item.endMode === 'SLOT_CAP' &&
                      item.slotCap != null &&
                      ` · ${t('commission.admin.opening.slotsTaken', {
                        taken: item.slotsTaken ?? 0,
                        cap: item.slotCap,
                      })}`}
                  </span>
                </div>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {item.closedAt
                    ? new Date(item.closedAt).toLocaleDateString()
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={confirmingClose !== null}
        title={t('commission.admin.opening.closeConfirmTitle')}
        description={t('commission.admin.opening.closeConfirmBody')}
        cancelLabel={t('commission.admin.opening.closeConfirmCancel')}
        confirmLabel={t('commission.admin.opening.closeConfirmSubmit')}
        onCancel={() => setConfirmingClose(null)}
        onConfirm={() => {
          const id = confirmingClose;
          setConfirmingClose(null);
          if (id) void runAction(() => close(id));
        }}
      />
    </div>
  );
}
