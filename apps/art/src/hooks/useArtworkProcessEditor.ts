'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useImageUpload } from '@hatohui/libs';
import {
  getAssetProcessQueryKey,
  useAssetProcess,
  useReplaceAssetProcess,
} from '@hatohui/models';

export interface EditableProcessStep {
  key: string;
  imageUrl: string;
  label: string;
}

export function useArtworkProcessEditor(assetId: string) {
  const queryClient = useQueryClient();
  const query = useAssetProcess(assetId);
  const replace = useReplaceAssetProcess();
  const { uploadImage, isUploading } = useImageUpload();
  const [draft, setDraft] = useState<EditableProcessStep[] | null>(null);
  const [hasError, setHasError] = useState(false);

  const saved: EditableProcessStep[] = (query.data?.data ?? []).map((step) => ({
    key: step.key,
    imageUrl: step.imageUrl,
    label: step.label ?? '',
  }));
  const steps = draft ?? saved;

  const edit = (
    next: (current: EditableProcessStep[]) => EditableProcessStep[],
  ) => setDraft((current) => next(current ?? saved));

  const addFiles = async (files: File[]) => {
    setHasError(false);
    try {
      for (const file of files) {
        const { key, publicUrl } = await uploadImage(file);
        edit((current) => [
          ...current,
          { key, imageUrl: publicUrl, label: '' },
        ]);
      }
    } catch {
      setHasError(true);
    }
  };

  const move = (index: number, offset: number) =>
    edit((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = async () => {
    setHasError(false);
    try {
      await replace.mutateAsync({
        id: assetId,
        data: {
          steps: steps.map(({ key, label }) => ({
            key,
            label: label.trim() || undefined,
          })),
        },
      });
      await queryClient.invalidateQueries({
        queryKey: getAssetProcessQueryKey(assetId),
      });
      setDraft(null);
    } catch {
      setHasError(true);
    }
  };

  return {
    steps,
    addFiles,
    setLabel: (index: number, label: string) =>
      edit((current) =>
        current.map((step, i) => (i === index ? { ...step, label } : step)),
      ),
    moveUp: (index: number) => move(index, -1),
    moveDown: (index: number) => move(index, 1),
    remove: (index: number) =>
      edit((current) => current.filter((_, i) => i !== index)),
    save,
    isDirty: draft !== null,
    isUploading,
    isSaving: replace.isPending,
    hasError,
  };
}
