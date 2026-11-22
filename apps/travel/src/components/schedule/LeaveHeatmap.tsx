import { useTranslation } from '@hatohui/i18n';
import type { TravelHeatmapEntryDto } from '@hatohui/models';

interface LeaveHeatmapProps {
  year: number;
  entries: TravelHeatmapEntryDto[];
}

function intensityClass(intensity: number): string {
  if (intensity >= 0.75) return 'bg-primary';
  if (intensity >= 0.4) return 'bg-primary/65';
  if (intensity > 0) return 'bg-primary/35';
  return 'bg-muted';
}

function LeaveHeatmap({ year, entries }: LeaveHeatmapProps) {
  const { t } = useTranslation();
  const map = new Map(entries.map((entry) => [entry.date, entry.intensity]));

  const days: Array<{ key: string; intensity: number }> = [];
  const cursor = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ key, intensity: map.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-base font-medium">
        {t('schedule.heatmapTitle', { year })}
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('schedule.heatmapEmpty', { year })}
        </p>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="grid auto-cols-max grid-flow-col grid-rows-7 gap-1">
            {days.map((day) => (
              <div
                key={day.key}
                title={`${day.key}: ${day.intensity.toFixed(2)}`}
                className={`size-3 rounded-[2px] ${intensityClass(day.intensity)}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default LeaveHeatmap;
