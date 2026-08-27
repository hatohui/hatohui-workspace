'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useImageUpload } from '@hatohui/libs';
import {
  Button,
  Checkbox,
  RichTextView,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@hatohui/ui';
import type { CreateCommissionProgressDtoVisibility as Visibility } from '@hatohui/models';
import { useCommissionProgressAdmin } from '@/hooks/useCommissionProgress';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';

export function CommissionProgressTimeline({
  commissionId,
}: {
  commissionId: string;
}) {
  const { t } = useTranslation('art');
  const { items, isLoading, create, remove } =
    useCommissionProgressAdmin(commissionId);
  const { uploadImage, isUploading } = useImageUpload();

  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [visibility, setVisibility] = useState<Visibility>('CLIENT');
  const [isFinal, setIsFinal] = useState(false);

  const submit = async () => {
    const uploaded = await Promise.all(files.map((file) => uploadImage(file)));
    await create({
      title: title.trim() || undefined,
      images: uploaded.map((asset) => asset.key),
      visibility,
      isFinal,
    });
    setTitle('');
    setFiles([]);
    setIsFinal(false);
  };

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <h2 className="text-sm font-medium">
        {t('commission.admin.progress.title')}
      </h2>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common:loading')}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('commission.admin.progress.empty')}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-md bg-card p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {item.title || t('commission.admin.progress.untitled')}
                  {item.isFinal && (
                    <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                      {t('commission.admin.progress.final')}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t(
                      item.visibility === 'CLIENT'
                        ? 'commission.admin.detail.noteVisibilityClient'
                        : 'commission.admin.detail.noteVisibilityInternal',
                    )}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void remove(item.id)}
                  >
                    {t('gallery.card.delete')}
                  </Button>
                </div>
              </div>
              {item.body && (
                <RichTextView value={item.body} className="text-sm" />
              )}
              {item.images.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {item.images.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="aspect-square w-full rounded object-cover"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 border-t border-border pt-3">
        <Textarea
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t('commission.admin.progress.titlePlaceholder')}
        />
        <MultiImageUploadField
          label={t('commission.admin.progress.imagesLabel')}
          files={files}
          onChange={setFiles}
          isUploading={isUploading}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={visibility}
            onValueChange={(value) => setVisibility(value as Visibility)}
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
              checked={isFinal}
              onCheckedChange={(checked) => setIsFinal(checked === true)}
            />
            {t('commission.admin.progress.markFinal')}
          </label>
          <Button
            size="sm"
            disabled={files.length === 0 || isUploading}
            onClick={() => void submit()}
          >
            {t('commission.admin.progress.post')}
          </Button>
        </div>
      </div>
    </div>
  );
}
