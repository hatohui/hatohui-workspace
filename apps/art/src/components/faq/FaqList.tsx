'use client';

import { useTranslation } from '@hatohui/i18n';
import type { FaqItemDto } from '@hatohui/models';
import { FaqItem } from './FaqItem';

export function FaqList({ items }: { items: FaqItemDto[] }) {
  const { t } = useTranslation('art');

  return (
    <div>
      <h1 className="font-serif text-3xl">{t('faq.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('faq.intro')}</p>
      {items.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          {t('faq.empty')}
        </p>
      ) : (
        <div className="mt-6 border-t border-border">
          {items.map((item, index) => (
            <FaqItem
              key={`${index}-${item.question}`}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
