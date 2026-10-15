'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { FAQ_ROUTE } from '@/constants/navigation';
import { useFaqEditor } from '@/hooks/useFaqEditor';
import { FaqEditorForm } from './FaqEditorForm';

export function FaqEditor() {
  const { t } = useTranslation('art');
  const editor = useFaqEditor();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl">{t('app.faq.title')}</h1>
          <p className="text-muted-foreground">{t('app.faq.description')}</p>
        </div>
        <Link
          href={FAQ_ROUTE}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {t('app.faq.viewPage')}
          <ExternalLink className="size-4" aria-hidden />
        </Link>
      </header>
      {editor.items ? (
        <FaqEditorForm
          initial={editor.items}
          saving={editor.isSaving}
          onSave={editor.save}
        />
      ) : (
        <p className="text-muted-foreground">{t('common:loading')}</p>
      )}
    </div>
  );
}
