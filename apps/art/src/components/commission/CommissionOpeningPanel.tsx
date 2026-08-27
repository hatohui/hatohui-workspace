'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import type {
  CommissionOpeningDto,
  UpsertCommissionOpeningDto,
} from '@hatohui/models';
import { useCommissionOpeningsAdmin } from '@/hooks/useCommissionOpenings';

const END_MODES: UpsertCommissionOpeningDto['endMode'][] = [
  'MANUAL',
  'SLOT_CAP',
  'INDEFINITE',
];

function OpeningForm({
  initial,
  onSave,
}: {
  initial?: CommissionOpeningDto;
  onSave: (dto: UpsertCommissionOpeningDto) => void;
}) {
  const { t } = useTranslation('art');
  const [endMode, setEndMode] = useState<UpsertCommissionOpeningDto['endMode']>(
    initial?.endMode ?? 'MANUAL',
  );
  const [slotCap, setSlotCap] = useState(
    initial?.slotCap != null ? String(initial.slotCap) : '',
  );
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : '',
  );
  const [postTitle, setPostTitle] = useState(initial?.postTitle ?? '');

  const canSave = endMode !== 'SLOT_CAP' || Number(slotCap) > 0;

  return (
    <div className="space-y-3">
      <div>
        <Label>{t('commission.admin.opening.endMode')}</Label>
        <Select
          value={endMode}
          onValueChange={(value) =>
            setEndMode(value as UpsertCommissionOpeningDto['endMode'])
          }
        >
          <SelectTrigger>
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
      </div>

      {endMode === 'SLOT_CAP' && (
        <div>
          <Label htmlFor="slot-cap">
            {t('commission.admin.opening.slotCap')}
          </Label>
          <Input
            id="slot-cap"
            type="number"
            min={1}
            value={slotCap}
            onChange={(event) => setSlotCap(event.target.value)}
          />
        </div>
      )}

      {!initial && (
        <div>
          <Label htmlFor="scheduled-at">
            {t('commission.admin.opening.scheduledAt')}
          </Label>
          <Input
            id="scheduled-at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {t('commission.admin.opening.scheduledAtHint')}
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="post-title">
          {t('commission.admin.opening.postTitle')}
        </Label>
        <Input
          id="post-title"
          value={postTitle}
          onChange={(event) => setPostTitle(event.target.value)}
        />
      </div>

      <Button
        disabled={!canSave}
        onClick={() =>
          onSave({
            endMode,
            slotCap: endMode === 'SLOT_CAP' ? Number(slotCap) : undefined,
            scheduledAt: scheduledAt
              ? new Date(scheduledAt).toISOString()
              : undefined,
            postTitle: postTitle || undefined,
          })
        }
      >
        {t('gallery.upload.save')}
      </Button>
    </div>
  );
}

export function CommissionOpeningPanel() {
  const { t } = useTranslation('art');
  const { items, isLoading, create, update, open, close } =
    useCommissionOpeningsAdmin();

  if (isLoading)
    return <p className="text-muted-foreground">{t('common:loading')}</p>;

  const active = items.find(
    (item) => item.status === 'OPEN' || item.status === 'SCHEDULED',
  );
  const history = items.filter((item) => item.id !== active?.id);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">
        {t('commission.admin.opening.title')}
      </h1>
      <section className="rounded-lg border border-border p-4">
        {active ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {t(`commission.admin.opening.status.${active.status}`)}
                </p>
                {active.endMode === 'SLOT_CAP' && active.slotCap != null && (
                  <p className="text-sm text-muted-foreground">
                    {t('commission.admin.opening.slotsTaken', {
                      taken: active.slotsTaken,
                      cap: active.slotCap,
                    })}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {active.status === 'SCHEDULED' && (
                  <Button size="sm" onClick={() => void open(active.id)}>
                    {t('commission.admin.opening.openNow')}
                  </Button>
                )}
                {active.status === 'OPEN' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void close(active.id)}
                  >
                    {t('commission.admin.opening.closeNow')}
                  </Button>
                )}
              </div>
            </div>
            <OpeningForm
              key={active.id}
              initial={active}
              onSave={(dto) => void update({ id: active.id, data: dto })}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground">
              {t('commission.admin.opening.none')}
            </p>
            <OpeningForm onSave={(dto) => void create({ data: dto })} />
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            {t('commission.admin.opening.history')}
          </h3>
          <ul className="space-y-1">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-md bg-card p-2 text-sm"
              >
                <span>
                  {t(`commission.admin.opening.status.${item.status}`)}
                </span>
                <span className="text-muted-foreground">
                  {item.closedAt
                    ? new Date(item.closedAt).toLocaleDateString()
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
