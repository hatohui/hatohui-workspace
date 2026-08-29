import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type ColumnSizingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EditableCell, type EditableCellOption } from './editable-cell';

export interface EditableColumn<T> {
  key: keyof T & string;
  label: string;
  editable?: boolean | ((row: T) => boolean);
  toggle?: boolean;
  options?: EditableCellOption[];
  render?: (row: T) => string;
  size?: number;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  sortable?: boolean;
}

export interface EditableDataTableProps<T extends { id: string }> {
  columns: EditableColumn<T>[];
  rows: T[];
  onCommit: (id: string, key: keyof T & string, value: string) => void;
  className?: string;
  storageKey?: string;
  onAddRow?: () => void;
  addRowLabel?: string;
  sortBy?: keyof T & string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (key: keyof T & string) => void;
  onDeleteRow?: (row: T) => void;
  deleteRowLabel?: string;
}

const DEFAULT_COLUMN_WIDTH = 160;
const MIN_COLUMN_WIDTH = 80;
const TOGGLE_COLUMN_WIDTH = 96;
const DELETE_COLUMN_WIDTH = 40;

function loadStoredSizing(storageKey: string | undefined): ColumnSizingState {
  if (!storageKey || typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(`editable-table:${storageKey}`);
    return raw ? (JSON.parse(raw) as ColumnSizingState) : {};
  } catch {
    return {};
  }
}

export function EditableDataTable<T extends { id: string }>({
  columns,
  rows,
  onCommit,
  className,
  storageKey,
  onAddRow,
  addRowLabel,
  sortBy,
  sortDirection,
  onSortChange,
  onDeleteRow,
  deleteRowLabel = 'Delete row',
}: EditableDataTableProps<T>) {
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(
    () => loadStoredSizing(storageKey),
  );
  const [containerWidth, setContainerWidth] = React.useState(0);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);

  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const columnsByKey = React.useMemo(
    () => new Map(columns.map((column) => [column.key, column])),
    [columns],
  );

  const columnDefs = React.useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((column) => ({
        id: column.key,
        accessorKey: column.key,
        header: column.label,
        size:
          column.size ??
          (column.toggle ? TOGGLE_COLUMN_WIDTH : DEFAULT_COLUMN_WIDTH),
        minSize: column.toggle ? TOGGLE_COLUMN_WIDTH : MIN_COLUMN_WIDTH,
      })),
    [columns],
  );

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: { columnSizing },
    onColumnSizingChange: (updater) => {
      setColumnSizing((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (storageKey) {
          window.localStorage.setItem(
            `editable-table:${storageKey}`,
            JSON.stringify(next),
          );
        }
        return next;
      });
    },
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
  });

  const fixedColumnsSize =
    columns.filter((column) => column.toggle).length * TOGGLE_COLUMN_WIDTH +
    (onDeleteRow ? DELETE_COLUMN_WIDTH : 0);

  const rawFlexSize = columns
    .filter((column) => !column.toggle)
    .reduce(
      (sum, column) => sum + (table.getColumn(column.key)?.getSize() ?? 0),
      0,
    );

  const flexAvailable = Math.max(0, containerWidth - fixedColumnsSize);

  const flexScale =
    rawFlexSize > 0 && flexAvailable > 0 ? flexAvailable / rawFlexSize : 1;

  const getColumnWidth = (columnId: string, rawSize: number) =>
    columnsByKey.get(columnId as keyof T & string)?.toggle
      ? TOGGLE_COLUMN_WIDTH
      : Math.max(MIN_COLUMN_WIDTH, Math.round(rawSize * flexScale));

  const tableWidth = containerWidth
    ? columns.reduce(
        (sum, column) =>
          sum +
          getColumnWidth(
            column.key,
            table.getColumn(column.key)?.getSize() ?? 0,
          ),
        onDeleteRow ? DELETE_COLUMN_WIDTH : 0,
      )
    : table.getTotalSize();

  const focusCell = (rowIndex: number, colIndex: number) => {
    const target = tableRef.current?.querySelector<HTMLButtonElement>(
      `[data-row="${rowIndex}"][data-col="${colIndex}"] button`,
    );
    target?.click();
  };

  return (
    <>
      <div
        ref={wrapperRef}
        className={cn(
          'hidden max-h-[70dvh] w-full overflow-auto rounded-md border border-border sm:block',
          className,
        )}
      >
        <table
          ref={tableRef}
          style={{ width: containerWidth ? tableWidth : table.getTotalSize() }}
          className="table-fixed border-collapse text-sm"
        >
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border bg-muted"
              >
                {headerGroup.headers.map((header) => {
                  const column = columnsByKey.get(
                    header.column.id as keyof T & string,
                  );
                  const sortable = column?.sortable && onSortChange;
                  const isSorted = sortBy === header.column.id;
                  const SortIcon = !isSorted
                    ? ChevronsUpDown
                    : sortDirection === 'asc'
                      ? ArrowUp
                      : ArrowDown;

                  return (
                    <th
                      key={header.id}
                      style={{
                        width: containerWidth
                          ? getColumnWidth(header.column.id, header.getSize())
                          : header.getSize(),
                      }}
                      className="relative truncate border-r border-border px-3 py-2 text-left font-medium last:border-r-0"
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() =>
                            onSortChange(header.column.id as keyof T & string)
                          }
                          className="flex cursor-pointer items-center gap-1 transition-colors duration-150 ease-out hover:text-foreground motion-reduce:transition-none"
                        >
                          <span className="truncate">
                            {header.column.columnDef.header as string}
                          </span>
                          <SortIcon
                            className={cn(
                              'size-3.5 shrink-0',
                              !isSorted && 'opacity-50',
                            )}
                          />
                        </button>
                      ) : (
                        (header.column.columnDef.header as string)
                      )}
                      {!column?.toggle && (
                        <div
                          onPointerDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            'absolute top-0 right-0 h-full w-1.5 cursor-col-resize touch-none select-none transition-colors duration-150 ease-out hover:bg-ring motion-reduce:transition-none',
                            header.column.getIsResizing() && 'bg-ring',
                          )}
                        />
                      )}
                    </th>
                  );
                })}
                {onDeleteRow && (
                  <th
                    className="sticky right-0 z-10 w-10 border-r-0 border-l border-border bg-muted px-2 py-2"
                    aria-hidden
                  />
                )}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-b-0"
              >
                {row.getVisibleCells().map((cell, colIndex) => {
                  const column = columnsByKey.get(
                    cell.column.id as keyof T & string,
                  );
                  if (!column) return null;
                  return (
                    <td
                      key={cell.id}
                      data-row={rowIndex}
                      data-col={colIndex}
                      style={{
                        width: containerWidth
                          ? getColumnWidth(
                              cell.column.id,
                              cell.column.getSize(),
                            )
                          : cell.column.getSize(),
                      }}
                      className="border-r border-border p-0 last:border-r-0"
                    >
                      <EditableCell
                        value={String(row.original[column.key] ?? '')}
                        displayValue={column.render?.(row.original)}
                        editable={
                          typeof column.editable === 'function'
                            ? column.editable(row.original)
                            : column.editable
                        }
                        toggle={column.toggle}
                        options={column.options}
                        selectPlaceholder={column.selectPlaceholder}
                        searchPlaceholder={column.searchPlaceholder}
                        emptyLabel={column.emptyLabel}
                        onCommit={(value) =>
                          onCommit(row.original.id, column.key, value)
                        }
                        onNavigate={(direction) => {
                          if (direction === 'down')
                            focusCell(rowIndex + 1, colIndex);
                          if (direction === 'right')
                            focusCell(rowIndex, colIndex + 1);
                        }}
                      />
                    </td>
                  );
                })}
                {onDeleteRow && (
                  <td className="sticky right-0 z-10 border-l border-border bg-background p-0 text-center">
                    <button
                      type="button"
                      aria-label={deleteRowLabel}
                      onClick={() => onDeleteRow(row.original)}
                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-destructive motion-reduce:transition-none"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {onAddRow && (
            <tfoot>
              <tr>
                <td
                  colSpan={onDeleteRow ? columns.length + 1 : columns.length}
                  className="p-0"
                >
                  <button
                    type="button"
                    onClick={onAddRow}
                    className="w-full cursor-pointer px-3 py-2 text-left text-sm text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground motion-reduce:transition-none"
                  >
                    + {addRowLabel}
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="overflow-hidden rounded-md border border-border"
          >
            {onDeleteRow && (
              <div className="flex justify-end border-b border-border bg-muted px-2 py-1">
                <button
                  type="button"
                  aria-label={deleteRowLabel}
                  onClick={() => onDeleteRow(row)}
                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-destructive motion-reduce:transition-none"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}
            <dl>
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-center justify-between gap-3 border-b border-border px-3 py-1 last:border-b-0"
                >
                  <dt className="shrink-0 py-1 text-xs font-medium text-muted-foreground">
                    {column.label}
                  </dt>
                  <dd className="min-w-0 flex-1">
                    <EditableCell
                      value={String(row[column.key] ?? '')}
                      displayValue={column.render?.(row)}
                      editable={
                        typeof column.editable === 'function'
                          ? column.editable(row)
                          : column.editable
                      }
                      toggle={column.toggle}
                      options={column.options}
                      selectPlaceholder={column.selectPlaceholder}
                      searchPlaceholder={column.searchPlaceholder}
                      emptyLabel={column.emptyLabel}
                      onCommit={(value) => onCommit(row.id, column.key, value)}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        {onAddRow && (
          <button
            type="button"
            onClick={onAddRow}
            className="w-full cursor-pointer rounded-md border border-dashed border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground motion-reduce:transition-none"
          >
            + {addRowLabel}
          </button>
        )}
      </div>
    </>
  );
}
