'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import type { FaqItemDto, UpdateArtistFaqDto } from '@hatohui/models';
import { FAQ_MAX_ITEMS } from '@/constants/faq';

export function useFaqForm(
  initial: FaqItemDto[],
  onSave: (args: { data: UpdateArtistFaqDto }) => Promise<unknown>,
) {
  const { t } = useTranslation('art');
  const toast = useToast();
  const [items, setItems] = useState(initial);

  const add = () =>
    setItems((current) => [...current, { question: '', answer: '' }]);

  const change = (index: number, patch: Partial<FaqItemDto>) =>
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const remove = (index: number) =>
    setItems((current) => current.filter((_, i) => i !== index));

  const move = (index: number, offset: number) =>
    setItems((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = async () => {
    try {
      await onSave({ data: { items } });
      toast.success(t('app.faq.saved'));
    } catch {
      toast.error(t('app.faq.saveFailed'));
    }
  };

  return {
    items,
    canAdd: items.length < FAQ_MAX_ITEMS,
    add,
    change,
    remove,
    move,
    save,
  };
}
