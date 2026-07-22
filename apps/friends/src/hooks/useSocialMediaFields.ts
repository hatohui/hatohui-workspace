import { useState } from 'react';

export type SocialMediaRow = {
  key: string;
  platform: string;
  handle: string;
};

let nextRowId = 0;

function createRow(platform = '', handle = ''): SocialMediaRow {
  nextRowId += 1;
  return { key: `row-${nextRowId.toString()}`, platform, handle };
}

export function useSocialMediaFields(initial: Record<string, string> = {}) {
  const [rows, setRows] = useState<SocialMediaRow[]>(() =>
    Object.entries(initial).map(([platform, handle]) =>
      createRow(platform, handle),
    ),
  );

  const addRow = () => setRows((prev) => [...prev, createRow()]);

  const removeRow = (key: string) =>
    setRows((prev) => prev.filter((row) => row.key !== key));

  const updateRow = (
    key: string,
    field: 'platform' | 'handle',
    value: string,
  ) =>
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );

  const toSocialMedias = (): Record<string, string> | undefined => {
    const entries: [string, string][] = rows
      .filter((row) => row.platform.trim() && row.handle.trim())
      .map((row) => [row.platform.trim(), row.handle.trim()]);
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  };

  return { rows, addRow, removeRow, updateRow, toSocialMedias };
}
