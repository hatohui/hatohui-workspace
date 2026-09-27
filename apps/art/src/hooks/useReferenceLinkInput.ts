'use client';

import { useState, type KeyboardEvent } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  REFERENCE_LINK_LIMIT,
  REFERENCE_LINK_PROTOCOLS,
  URL_PROTOCOL_PATTERN,
} from '@/constants/commission';

function isWebLink(value: string): boolean {
  if (!URL.canParse(value)) return false;
  return REFERENCE_LINK_PROTOCOLS.includes(new URL(value).protocol);
}

export function useReferenceLinkInput(
  links: string[],
  onChange: (links: string[]) => void,
) {
  const { t } = useTranslation('art');
  const [draft, setDraftState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isFull = links.length >= REFERENCE_LINK_LIMIT;

  const setDraft = (value: string) => {
    setDraftState(value);
    setError(null);
  };

  const add = () => {
    const typed = draft.trim();
    if (!typed) return;
    const url = URL_PROTOCOL_PATTERN.test(typed) ? typed : `https://${typed}`;
    if (!isWebLink(url)) {
      setError(t('commission.form.linkInvalid'));
      return;
    }
    if (!links.includes(url)) onChange([...links, url]);
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    add();
  };

  const remove = (url: string) =>
    onChange(links.filter((link) => link !== url));

  return {
    draft,
    setDraft,
    error,
    add,
    onKeyDown,
    remove,
    isFull,
    limitHint: t('commission.form.linkLimit', { count: REFERENCE_LINK_LIMIT }),
  };
}
