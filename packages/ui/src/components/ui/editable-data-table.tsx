import * as React from 'react';
import { cn } from '../../lib/utils';
import { EditableCell, type EditableCellOption } from './editable-cell';

export interface EditableColumn<T> {
  key: keyof T & string;
  label: string;
  editable?: boolean;
  options?: EditableCellOption[];
  render?: (row: T) => string;
}

export interface EditableDataTableProps<T extends { id: string }> {
  columns: EditableColumn<T>[];
  rows: T[];
  onCommit: (id: string, key: keyof T & string, value: string) => void;
  className?: string;
}

export function EditableDataTable<T extends { id: string }>({
  columns,
  rows,
  onCommit,
  className,
}: EditableDataTableProps<T>) {
  const tableRef = React.useRef<HTMLTableElement>(null);

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
      <table ref={tableRef} className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((column) => (
              <th
                key={column.key}
                className="border-r border-border px-3 py-2 text-left font-medium last:border-r-0"
              >
                {column.label}
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
