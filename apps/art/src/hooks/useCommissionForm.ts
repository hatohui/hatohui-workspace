'use client';

import { useEffect, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import {
  useSubmitCommission,
  type CommissionIdentityDto,
} from '@hatohui/models';
import { useAuth, useImageUpload, isTiptapDocEmpty } from '@hatohui/libs';
import {
  EMAIL_CONTACT_PLATFORM,
  EMPTY_COMMISSION_IDEA,
} from '@/constants/commission';
import { useCommissionPricingEstimate } from './useCommissionPricingEstimate';
import { useIdentityMatch } from './useIdentityMatch';

export interface CommissionFormState {
  idea: JSONContent;
  deadline: string;
  commissionTypeId: string;
  optionKey: string;
  addonKeys: string[];
  clientName: string;
  clientEmail: string;
  clientHandle: string;
  matchedIdentity: CommissionIdentityDto | null;
  declinedProfileIds: string[];
  contactPlatform: string;
  contactValue: string;
  isNewContact: boolean;
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
  clientHandle: '',
  matchedIdentity: null,
  declinedProfileIds: [],
  contactPlatform: EMAIL_CONTACT_PLATFORM,
  contactValue: '',
  isNewContact: false,
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

export function useCommissionForm(artistId: string) {
  const [state, setState] = useState<CommissionFormState>(INITIAL_STATE);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);

  // Restoring a draft must happen post-mount, not in a lazy initializer:
  // localStorage doesn't exist during the server render, so an initializer
  // that read it would disagree with the client's first paint and fail
  // hydration. This is exactly what an effect is for - syncing from an
  // external system unavailable at render time.
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const { user, isLoading: isAuthLoading } = useAuth();
  const submitCommission = useSubmitCommission();
  const { uploadImage, isUploading } = useImageUpload();
  const pricing = useCommissionPricingEstimate(
    artistId,
    state.commissionTypeId || undefined,
    state.optionKey || undefined,
    state.addonKeys,
    state.deadline || undefined,
  );

  const isIdeaEmpty = isTiptapDocEmpty(state.idea);
  const needsIdentity = !isAuthLoading && !user;

  const suggestedIdentity = useIdentityMatch({
    name: state.clientName,
    handle: state.clientHandle,
    email: state.clientEmail,
    enabled: needsIdentity && !state.matchedIdentity,
    declinedProfileIds: state.declinedProfileIds,
  });

  const update = <K extends keyof CommissionFormState>(
    key: K,
    value: CommissionFormState[K],
  ) => setState((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (isIdeaEmpty) return;
    setHasSubmitError(false);

    try {
      await submitWithUploads();
    } catch {
      setHasSubmitError(true);
      return;
    }

    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setIsSubmitted(true);
  };

  const submitWithUploads = async () => {
    const uploaded = await Promise.all(
      files.map((file) => uploadImage(file, state.clientName)),
    );

    await submitCommission.mutateAsync({
      data: {
        artistId,
        idea: state.idea,
        deadline: state.deadline || undefined,
        commissionTypeId: state.commissionTypeId || undefined,
        optionKey: pricing.selectedOption?.key ?? state.optionKey ?? undefined,
        addonKeys: state.addonKeys,
        ...(user
          ? {}
          : {
              clientName: state.clientName,
              clientEmail: state.clientEmail,
              clientHandle: state.clientHandle || undefined,
              matchedProfileId: state.matchedIdentity?.profileId,
            }),
        contactPlatform: state.contactPlatform,
        contactValue:
          state.contactPlatform === EMAIL_CONTACT_PLATFORM
            ? undefined
            : state.contactValue,
        referenceAssets: uploaded.map((asset) => asset.key),
        isPublic: state.isPublic,
      },
    });
  };

  const confirmIdentity = (identity: CommissionIdentityDto) =>
    setState((prev) => ({ ...prev, matchedIdentity: identity }));

  const declineIdentity = (identity: CommissionIdentityDto) =>
    setState((prev) => ({
      ...prev,
      declinedProfileIds: [...prev.declinedProfileIds, identity.profileId],
    }));

  const clearIdentity = () =>
    setState((prev) => ({
      ...prev,
      matchedIdentity: null,
      declinedProfileIds: prev.matchedIdentity
        ? [...prev.declinedProfileIds, prev.matchedIdentity.profileId]
        : prev.declinedProfileIds,
      contactPlatform: EMAIL_CONTACT_PLATFORM,
      contactValue: '',
      isNewContact: false,
    }));

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
    signedInName: user?.name ?? null,
    isSignedIn: Boolean(user),
    needsIdentity,
    suggestedIdentity,
    confirmIdentity,
    declineIdentity,
    clearIdentity,
    hasSubmitError,
    isDraftRestored,
    isIdeaEmpty,
    pricing,
  };
}
