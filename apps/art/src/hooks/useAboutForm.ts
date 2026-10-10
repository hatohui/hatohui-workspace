'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import type { ArtistAboutDto, UpdateArtistAboutDto } from '@hatohui/models';
import { ABOUT_FACTS_SEPARATOR } from '@/constants/about';

export function useAboutForm(
  initial: ArtistAboutDto,
  onSave: (args: { data: UpdateArtistAboutDto }) => Promise<unknown>,
) {
  const { t } = useTranslation('art');
  const toast = useToast();
  const [headline, setHeadline] = useState(initial.headline);
  const [intro, setIntro] = useState(initial.intro);
  const [body, setBody] = useState(initial.body);
  const [facts, setFacts] = useState(initial.facts.join(ABOUT_FACTS_SEPARATOR));

  const save = async () => {
    try {
      await onSave({
        data: {
          headline,
          intro,
          body,
          facts: facts.split(ABOUT_FACTS_SEPARATOR).filter((f) => f.trim()),
        },
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
    facts,
    setFacts,
    save,
  };
}
