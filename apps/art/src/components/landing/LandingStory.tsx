'use client';

import { useTranslation } from '@hatohui/i18n';
import { Markdown } from '@/components/shared/Markdown';

export function LandingStory({ body }: { body: string }) {
  const { t } = useTranslation('art');

  if (!body) return null;

  return (
    <section
      data-landing="reveal"
      className="mx-auto mb-20 max-w-2xl rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-10"
    >
      <h2 className="mb-4 font-serif text-3xl">{t('landing.aboutTitle')}</h2>
      <Markdown className="space-y-4 text-base leading-relaxed text-muted-foreground">
        {body}
      </Markdown>
    </section>
  );
}
