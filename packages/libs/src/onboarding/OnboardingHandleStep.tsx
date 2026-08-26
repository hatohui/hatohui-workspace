import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { getErrorCategory } from '../errors/getErrorCategory';

const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

type Props = {
  initialHandle: string;
  onSubmit: (handle?: string) => void;
  onSkip: () => void;
  submitting: boolean;
  error?: unknown;
};

function OnboardingHandleStep({
  initialHandle,
  onSubmit,
  onSkip,
  submitting,
  error,
}: Props) {
  const { t } = useTranslation();
  const [handle, setHandle] = useState(initialHandle);
  const trimmed = handle.trim().toLowerCase();
  const isValid = trimmed.length === 0 || HANDLE_PATTERN.test(trimmed);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">{t('common:onboarding.handle.title')}</h2>
      <p className="text-sm text-muted-foreground">
        {t('common:onboarding.handle.description')}
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="onboarding-handle" className="sr-only">
          @{t('common:onboarding.handle.placeholder')}
        </Label>
        <div className="flex h-9 items-center gap-1 rounded-md border border-input bg-transparent px-3 shadow-xs transition-[color,box-shadow] has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50 dark:bg-input/30">
          <span className="text-base text-muted-foreground select-none md:text-sm">
            @
          </span>
          <Input
            id="onboarding-handle"
            value={handle}
            placeholder={t('common:onboarding.handle.placeholder')}
            onChange={(event) => setHandle(event.target.value)}
            className="h-auto border-0 bg-transparent px-0 py-0 shadow-none placeholder:text-foreground/70 placeholder:italic focus-visible:ring-0 dark:bg-transparent"
          />
        </div>
        {!isValid && (
          <p role="alert" className="text-sm text-destructive">
            {t('common:onboarding.handle.invalid')}
          </p>
        )}
        {error != null && (
          <p role="alert" className="text-sm text-destructive">
            {t(`common:errors.${getErrorCategory(error)}`)}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          disabled={submitting || !isValid || trimmed.length === 0}
          onClick={() => onSubmit(trimmed)}
          className="w-fit"
        >
          {t('common:onboarding.next')}
        </Button>
        <Button
          variant="ghost"
          disabled={submitting}
          onClick={onSkip}
          className="w-fit"
        >
          {t('common:onboarding.skip')}
        </Button>
      </div>
    </div>
  );
}

export default OnboardingHandleStep;
