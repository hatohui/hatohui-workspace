import * as React from 'react';
import { cn } from '../../lib/utils';
import { EditableCell, type EditableCellOption } from './editable-cell';

export interface EditableColumn<T> {
  key: keyof T & string;
  label: string;
  editable?: boolean;
  options?: EditableCellOption[];
  render?: (row: T) => string;
  width?: string;
}

export interface EditableDataTableProps<T extends { id: string }> {
  columns: EditableColumn<T>[];
  rows: T[];
  onCommit: (id: string, key: keyof T & string, value: string) => void;
  className?: string;
  /** When set, column widths persist to localStorage under this key. */
  storageKey?: string;
}

const MIN_COLUMN_WIDTH = 80;

function loadStoredWidths(storageKey: string | undefined) {
  if (!storageKey || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`editable-table:${storageKey}`);
    return raw ? (JSON.parse(raw) as Record<string, number>) : null;
  } catch {
    return null;
  }
}

export function EditableDataTable<T extends { id: string }>({
  columns,
  rows,
  onCommit,
  className,
  storageKey,
}: EditableDataTableProps<T>) {
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [widths, setWidths] = React.useState<Record<string, number>>(
    () => loadStoredWidths(storageKey) ?? {},
  );

  const persistWidths = (next: Record<string, number>) => {
    setWidths(next);
    if (!storageKey) return;
    window.localStorage.setItem(
      `editable-table:${storageKey}`,
      JSON.stringify(next),
    );
  };

  const startResize = (
    event: React.PointerEvent<HTMLDivElement>,
    columnKey: string,
    currentWidth: number,
  ) => {
    event.preventDefault();
    const startX = event.clientX;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    const handleMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = Math.max(MIN_COLUMN_WIDTH, currentWidth + delta);
      setWidths((prev) => ({ ...prev, [columnKey]: nextWidth }));
    };

    const handleUp = (upEvent: PointerEvent) => {
      const delta = upEvent.clientX - startX;
      const nextWidth = Math.max(MIN_COLUMN_WIDTH, currentWidth + delta);
      persistWidths({ ...widths, [columnKey]: nextWidth });
      target.releasePointerCapture(upEvent.pointerId);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const focusCell = (rowIndex: number, colIndex: number) => {
    const target = tableRef.current?.querySelector<HTMLButtonElement>(
      `[data-row="${rowIndex}"][data-col="${colIndex}"] button`,
    );
    target?.click();
  };

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-md border border-border',
        className,
      )}
    >
      <table
        ref={tableRef}
        className="w-full table-fixed border-collapse text-sm"
      >
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  width: widths[column.key]
                    ? `${widths[column.key]}px`
                    : column.width,
                }}
                className="relative truncate border-r border-border px-3 py-2 text-left font-medium last:border-r-0"
              >
                {column.label}
                <div
                  onPointerDown={(event) =>
                    startResize(
                      event,
                      column.key,
                      event.currentTarget.parentElement?.getBoundingClientRect()
                        .width ?? MIN_COLUMN_WIDTH,
                    )
                  }
                  className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize touch-none select-none hover:bg-ring"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id} className="border-b border-border last:border-b-0">
              {columns.map((column, colIndex) => (
                <td
                  key={column.key}
                  data-row={rowIndex}
                  data-col={colIndex}
                  className="border-r border-border p-0 last:border-r-0"
                >
                  <EditableCell
                    value={String(row[column.key] ?? '')}
                    displayValue={column.render?.(row)}
                    editable={column.editable}
                    options={column.options}
                    onCommit={(value) => onCommit(row.id, column.key, value)}
                    onNavigate={(direction) => {
                      if (direction === 'down')
                        focusCell(rowIndex + 1, colIndex);
                      if (direction === 'right')
                        focusCell(rowIndex, colIndex + 1);
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
