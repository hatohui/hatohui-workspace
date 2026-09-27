'use client';

import { useState } from 'react';
import { DATE_INPUT_DIGITS, DATE_INPUT_SEPARATOR } from '@/constants/dateInput';

export function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplay(date: Date | undefined): string {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}${DATE_INPUT_SEPARATOR}${month}${DATE_INPUT_SEPARATOR}${date.getFullYear()}`;
}

function maskDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, DATE_INPUT_DIGITS);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)];
  return parts.filter(Boolean).join(DATE_INPUT_SEPARATOR);
}

function parseTyped(text: string): Date | undefined {
  const [day, month, year] = text.split(DATE_INPUT_SEPARATOR).map(Number);
  if (!day || !month || !year || String(year).length !== 4) return undefined;
  const date = new Date(year, month - 1, day);
  const isReal =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return isReal ? date : undefined;
}

export function useDateInput(value: string, onChange: (value: string) => void) {
  const selected = parseIsoDate(value);
  const [text, setText] = useState(() => formatDisplay(selected));
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(formatDisplay(parseIsoDate(value)));
  }

  const type = (raw: string) => {
    const masked = maskDigits(raw);
    setText(masked);
    if (!masked) {
      onChange('');
      return;
    }
    const date = parseTyped(masked);
    if (date) onChange(toIsoDate(date));
  };

  const commit = () => {
    if (text && !parseTyped(text)) setText(formatDisplay(selected));
  };

  const pick = (date: Date | undefined) =>
    onChange(date ? toIsoDate(date) : '');

  return { text, selected, type, commit, pick, clear: () => onChange('') };
}
