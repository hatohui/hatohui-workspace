'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@hatohui/ui';
import type { CreateCommissionProgressDtoVisibility as Visibility } from '@hatohui/models';
import type { useProgressPostForm } from '@/hooks/useProgressPostForm';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';

export function CommissionProgressPostForm({
  form,
}: {
  form: ReturnType<typeof useProgressPostForm>;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <Input
        value={form.title}
        onChange={(event) => form.setTitle(event.target.value)}
        placeholder={t('commission.admin.progress.titlePlaceholder')}
      />
      <Textarea
        value={form.description}
        onChange={(event) => form.setDescription(event.target.value)}
        onPaste={form.inline.onPaste}
        onDrop={form.inline.onDrop}
        placeholder={t('commission.admin.progress.descriptionPlaceholder')}
        className="min-h-24"
      />
      <MultiImageUploadField
        label={t('commission.admin.progress.imagesLabel')}
        files={form.files}
        onChange={form.setFiles}
        isUploading={form.isBusy}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={form.visibility}
          onValueChange={(value) => form.setVisibility(value as Visibility)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CLIENT">
              {t('commission.admin.detail.noteVisibilityClient')}
            </SelectItem>
            <SelectItem value="INTERNAL">
              {t('commission.admin.detail.noteVisibilityInternal')}
            </SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.isFinal}
            onCheckedChange={(checked) => form.setIsFinal(checked === true)}
          />
          {t('commission.admin.progress.markFinal')}
        </label>
        {form.visibility === 'CLIENT' && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.requestsApproval}
              onCheckedChange={(checked) =>
                form.setRequestsApproval(checked === true)
              }
            />
            {t('commission.admin.progress.requestApproval')}
          </label>
        )}
        <Button
          size="sm"
          disabled={!form.canPost}
          onClick={() => void form.submit()}
        >
          {t('commission.admin.progress.post')}
        </Button>
      </div>
    </div>
  );
}
