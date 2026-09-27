'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Trans } from '@hatohui/i18n';
import { Checkbox } from '@hatohui/ui';
import { artistFaqPath } from '@/constants/navigation';
import { CommissionFieldError } from './CommissionFieldError';

export function CommissionTermsCheckbox({
  accepted,
  onChange,
  error,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  error: string | null;
}) {
  const { artist } = useParams<{ artist: string }>();

  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          id="acceptTerms"
          checked={accepted}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'acceptTerms-error' : undefined}
          onCheckedChange={(value) => onChange(value === true)}
        />
        <span>
          <Trans
            ns="art"
            i18nKey="commission.form.acceptTerms"
            components={{
              link: (
                <Link
                  href={artistFaqPath(artist)}
                  target="_blank"
                  className="text-primary underline-offset-2 hover:underline"
                />
              ),
            }}
          />
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        </span>
      </label>
      <CommissionFieldError id="acceptTerms-error" message={error} />
    </div>
  );
}
