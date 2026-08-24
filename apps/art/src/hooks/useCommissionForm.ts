'use client';

import { useEffect, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import {
  useSubmitCommission,
  type SubmitCommissionDtoPreferredContactMethod,
} from '@hatohui/models';
import { useImageUpload, isTiptapDocEmpty } from '@hatohui/libs';
import { EMPTY_COMMISSION_IDEA } from '@/constants/commission';
import { useCommissionPricingEstimate } from './useCommissionPricingEstimate';

export interface CommissionFormState {
  idea: JSONContent;
  deadline: string;
  commissionTypeId: string;
  optionKey: string;
  addonKeys: string[];
  clientName: string;
  clientEmail: string;
  preferredContactMethod: SubmitCommissionDtoPreferredContactMethod;
  contactHandle: string;
  isPublic: boolean;
}

const INITIAL_STATE: CommissionFormState = {
  idea: EMPTY_COMMISSION_IDEA,
  deadline: '',
  commissionTypeId: '',
  optionKey: '',
  addonKeys: [],
  clientName: '',
  clientEmail: '',
  preferredContactMethod: 'EMAIL',
  contactHandle: '',
  isPublic: false,
};

const DRAFT_STORAGE_KEY = 'hatohui:art:commission-draft';

function loadDraft(): CommissionFormState | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return {
      ...INITIAL_STATE,
      ...(JSON.parse(raw) as Partial<CommissionFormState>),
    };
  } catch {
    return null;
  }
}

export function useCommissionForm() {
  const [state, setState] = useState<CommissionFormState>(INITIAL_STATE);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setState(draft);
      setIsDraftRestored(true);
    }
  }, []);

  useEffect(() => {
    if (isSubmitted) return;
    const isEmpty = JSON.stringify(state) === JSON.stringify(INITIAL_STATE);
    if (isEmpty) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
  }, [state, isSubmitted]);

  const submitCommission = useSubmitCommission();
  const { uploadImage, isUploading } = useImageUpload();
  const pricing = useCommissionPricingEstimate(
    state.commissionTypeId || undefined,
    state.optionKey || undefined,
    state.addonKeys,
    state.deadline || undefined,
  );

  const isIdeaEmpty = isTiptapDocEmpty(state.idea);

  const update = <K extends keyof CommissionFormState>(
    key: K,
    value: CommissionFormState[K],
  ) => setState((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (isIdeaEmpty) return;

    const uploaded = await Promise.all(files.map((file) => uploadImage(file)));

    await submitCommission.mutateAsync({
      data: {
        idea: state.idea,
        deadline: state.deadline || undefined,
        commissionTypeId: state.commissionTypeId || undefined,
        optionKey: state.optionKey || undefined,
        addonKeys: state.addonKeys,
        clientName: state.clientName,
        clientEmail: state.clientEmail,
        preferredContactMethod: state.preferredContactMethod,
        contactHandle: state.contactHandle || undefined,
        referenceAssets: uploaded.map((asset) => asset.key),
        isPublic: state.isPublic,
      },
    });

    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setIsSubmitted(true);
  };

  const reset = () => {
    setState(INITIAL_STATE);
    setFiles([]);
    setIsDraftRestored(false);
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  return {
    state,
    update,
    files,
    setFiles,
    submit,
    reset,
    isSubmitting: submitCommission.isPending || isUploading,
    isSubmitted,
    isDraftRestored,
    isIdeaEmpty,
    pricing,
  };
}
