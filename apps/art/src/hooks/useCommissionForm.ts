'use client';

import { useEffect, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import {
  useMyCommissionIdentity,
  useSubmitCommission,
  type CommissionIdentityDto,
} from '@hatohui/models';
import { useAuth, useImageUpload, isTiptapDocEmpty } from '@hatohui/libs';
import {
  EMAIL_CONTACT_PLATFORM,
  COMMISSION_MIN_DEADLINE_DAYS,
  EMPTY_COMMISSION_IDEA,
  LEADING_AT_PATTERN,
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
  matchedIdentity: CommissionIdentityDto | null;
  declinedProfileIds: string[];
  contactPlatform: string;
  contactValue: string;
  isNewContact: boolean;
  isPublic: boolean;
  acceptedTerms: boolean;
  referenceLinks: string[];
}

const INITIAL_STATE: CommissionFormState = {
  idea: EMPTY_COMMISSION_IDEA,
  deadline: '',
  commissionTypeId: '',
  optionKey: '',
  addonKeys: [],
  clientName: '',
  clientEmail: '',
  matchedIdentity: null,
  declinedProfileIds: [],
  contactPlatform: EMAIL_CONTACT_PLATFORM,
  contactValue: '',
  isNewContact: false,
  isPublic: true,
  acceptedTerms: false,
  referenceLinks: [],
};

const DRAFT_STORAGE_KEY = 'hatohui:art:commission-draft';

function hasDraftContent(state: CommissionFormState): boolean {
  return (
    !isTiptapDocEmpty(state.idea) ||
    Boolean(
      state.deadline ||
      state.commissionTypeId ||
      state.addonKeys.length > 0 ||
      state.referenceLinks.length > 0 ||
      state.clientName.trim() ||
      state.clientEmail.trim() ||
      state.matchedIdentity ||
      state.contactValue.trim(),
    )
  );
}

function earliestDeadline(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + COMMISSION_MIN_DEADLINE_DAYS);
  return date;
}

function contactHandleOf(state: CommissionFormState): string {
  if (state.contactPlatform === EMAIL_CONTACT_PLATFORM) return '';
  return state.contactValue.trim().replace(LEADING_AT_PATTERN, '');
}

function loadDraft(): CommissionFormState | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CommissionFormState>;
    const draft = {
      ...INITIAL_STATE,
      ...parsed,
      contactPlatform: parsed.contactPlatform || EMAIL_CONTACT_PLATFORM,
    };
    return hasDraftContent(draft) ? draft : null;
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
    if (!hasDraftContent(state)) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
  }, [state, isSubmitted]);

  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: mine } = useMyCommissionIdentity({
    query: { enabled: Boolean(user) },
  });
  const myIdentity = mine?.data.identity ?? null;
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
  const contactHandle = contactHandleOf(state);
  const needsIdentity = !isAuthLoading && !user;

  const suggestedIdentity = useIdentityMatch({
    name: state.clientName,
    handle: contactHandle,
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
              clientEmail: state.matchedIdentity?.hasEmail
                ? undefined
                : state.clientEmail.trim() || undefined,
              clientHandle: contactHandle || undefined,
              matchedProfileId: state.matchedIdentity?.profileId,
            }),
        contactPlatform: state.contactPlatform,
        contactValue:
          state.contactPlatform === EMAIL_CONTACT_PLATFORM
            ? undefined
            : state.contactValue,
        referenceAssets: uploaded.map((asset) => asset.key),
        referenceUrls: state.referenceLinks,
        isPublic: state.isPublic,
      },
    });
  };

  const confirmIdentity = (identity: CommissionIdentityDto) =>
    setState((prev) => ({
      ...prev,
      matchedIdentity: identity,
      clientName: identity.displayName,
    }));

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
    signedInIdentity: user
      ? {
          displayName: myIdentity?.displayName ?? user.name,
          handle: myIdentity?.handle ?? null,
          avatarUrl: myIdentity?.avatarUrl ?? user.avatarUrl,
        }
      : null,
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
    earliestDeadline: earliestDeadline(),
  };
}
