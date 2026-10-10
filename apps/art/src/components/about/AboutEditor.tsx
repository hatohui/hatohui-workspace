'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { HOME_ROUTE } from '@/constants/navigation';
import { useAboutEditor } from '@/hooks/useAboutEditor';
import { AboutEditorForm } from './AboutEditorForm';

export function AboutEditor() {
  const { t } = useTranslation('art');
  const editor = useAboutEditor();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl">{t('app.about.title')}</h1>
          <p className="text-muted-foreground">{t('app.about.description')}</p>
        </div>
        <Link
          href={HOME_ROUTE}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {t('app.about.viewPage')}
          <ExternalLink className="size-4" aria-hidden />
        </Link>
      </header>
      {editor.about ? (
        <AboutEditorForm
          initial={editor.about}
          saving={editor.isSaving}
          onSave={editor.save}
        />
      ) : (
        <p className="text-muted-foreground">{t('common:loading')}</p>
      )}
    </div>
  );
}
