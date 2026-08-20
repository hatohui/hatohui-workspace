import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type ColumnSizingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EditableCell, type EditableCellOption } from './editable-cell';

export interface EditableColumn<T> {
  key: keyof T & string;
  label: string;
  editable?: boolean | ((row: T) => boolean);
  options?: EditableCellOption[];
  render?: (row: T) => string;
  /** Initial column width in pixels. */
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
  /** When set, column widths persist to localStorage under this key. */
  storageKey?: string;
  /** When set, renders a trailing "+ addRowLabel" row that calls this. */
  onAddRow?: () => void;
  addRowLabel?: string;
  sortBy?: keyof T & string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (key: keyof T & string) => void;
}

const DEFAULT_COLUMN_WIDTH = 160;
const MIN_COLUMN_WIDTH = 80;

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
}: EditableDataTableProps<T>) {
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(
    () => loadStoredSizing(storageKey),
  );
  const tableRef = React.useRef<HTMLTableElement>(null);
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
        size: column.size ?? DEFAULT_COLUMN_WIDTH,
        minSize: MIN_COLUMN_WIDTH,
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

  const focusCell = (rowIndex: number, colIndex: number) => {
    const target = tableRef.current?.querySelector<HTMLButtonElement>(
      `[data-row="${rowIndex}"][data-col="${colIndex}"] button`,
    );
    target?.click();
  };

  return (
    <div
      className={cn(
        'max-h-[70vh] w-full overflow-auto rounded-md border border-border',
        className,
      )}
    >
      <table
        ref={tableRef}
        style={{ width: table.getTotalSize(), minWidth: '100%' }}
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
                    style={{ width: header.getSize() }}
                    className="relative truncate border-r border-border px-3 py-2 text-left font-medium last:border-r-0"
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSortChange(header.column.id as keyof T & string)
                        }
                        className="flex items-center gap-1 hover:text-foreground"
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
                    <div
                      onPointerDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={cn(
                        'absolute top-0 right-0 h-full w-1.5 cursor-col-resize touch-none select-none hover:bg-ring',
                        header.column.getIsResizing() && 'bg-ring',
                      )}
                    />
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr key={row.id} className="border-b border-border last:border-b-0">
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
                    style={{ width: cell.column.getSize() }}
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
            </tr>
          ))}
        </tbody>
        {onAddRow && (
          <tfoot>
            <tr>
              <td colSpan={columns.length} className="p-0">
                <button
                  type="button"
                  onClick={onAddRow}
                  className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  + {addRowLabel}
                </button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
