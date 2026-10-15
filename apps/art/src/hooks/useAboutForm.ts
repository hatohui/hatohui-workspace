'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import type { ArtistAboutDto, UpdateArtistAboutDto } from '@hatohui/models';

export function useAboutForm(
  initial: ArtistAboutDto,
  onSave: (args: { data: UpdateArtistAboutDto }) => Promise<unknown>,
) {
  const { t } = useTranslation('art');
  const toast = useToast();
  const [headline, setHeadline] = useState(initial.headline);
  const [intro, setIntro] = useState(initial.intro);
  const [body, setBody] = useState(initial.body);

  const save = async () => {
    try {
      await onSave({
        data: { headline, intro, body },
      });
      toast.success(t('app.about.saved'));
    } catch {
      toast.error(t('app.about.saveFailed'));
    }
  };

  return {
    headline,
    setHeadline,
    intro,
    setIntro,
    body,
    setBody,
    save,
  };
}
