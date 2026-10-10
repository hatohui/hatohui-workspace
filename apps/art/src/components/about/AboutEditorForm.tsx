'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Spinner, Textarea } from '@hatohui/ui';
import type { ArtistAboutDto, UpdateArtistAboutDto } from '@hatohui/models';
import {
  ABOUT_BODY_ROWS,
  ABOUT_FACTS_ROWS,
  ABOUT_INTRO_ROWS,
} from '@/constants/about';
import { useAboutForm } from '@/hooks/useAboutForm';
import { AboutField } from './AboutField';

export function AboutEditorForm({
  initial,
  saving,
  onSave,
}: {
  initial: ArtistAboutDto;
  saving: boolean;
  onSave: (args: { data: UpdateArtistAboutDto }) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const form = useAboutForm(initial, onSave);

  return (
    <div className="max-w-2xl space-y-5">
      <AboutField id="about-headline" label={t('app.about.headline')}>
        <Input
          id="about-headline"
          value={form.headline}
          onChange={(event) => form.setHeadline(event.target.value)}
        />
      </AboutField>
      <AboutField id="about-intro" label={t('app.about.intro')}>
        <Textarea
          id="about-intro"
          rows={ABOUT_INTRO_ROWS}
          value={form.intro}
          onChange={(event) => form.setIntro(event.target.value)}
        />
      </AboutField>
      <AboutField
        id="about-body"
        label={t('app.about.body')}
        hint={t('app.about.bodyHint')}
      >
        <Textarea
          id="about-body"
          rows={ABOUT_BODY_ROWS}
          value={form.body}
          onChange={(event) => form.setBody(event.target.value)}
        />
      </AboutField>
      <AboutField
        id="about-facts"
        label={t('app.about.facts')}
        hint={t('app.about.factsHint')}
      >
        <Textarea
          id="about-facts"
          rows={ABOUT_FACTS_ROWS}
          value={form.facts}
          onChange={(event) => form.setFacts(event.target.value)}
        />
      </AboutField>
      <Button disabled={saving} onClick={() => void form.save()}>
        {saving && <Spinner className="size-4" />}
        {t('app.about.save')}
      </Button>
    </div>
  );
}
