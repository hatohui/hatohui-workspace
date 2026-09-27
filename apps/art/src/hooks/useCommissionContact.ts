'use client';

import {
  useMyCommissionIdentity,
  useSocialPlatforms,
  type ContactPointDto,
} from '@hatohui/models';
import {
  EMAIL_CONTACT_PLATFORM,
  NEW_CONTACT_OPTION,
} from '@/constants/commission';
import type { useCommissionForm } from './useCommissionForm';

type CommissionForm = ReturnType<typeof useCommissionForm>;

export function useCommissionContact(form: CommissionForm) {
  const { state, update, isSignedIn } = form;
  const { data: mine } = useMyCommissionIdentity({
    query: { enabled: isSignedIn },
  });
  const { data: platformData } = useSocialPlatforms();

  const identity = isSignedIn
    ? (mine?.data.identity ?? null)
    : state.matchedIdentity;
  const existingContacts: ContactPointDto[] = identity?.contacts ?? [];
  const email = isSignedIn ? (mine?.data.email ?? '') : state.clientEmail;
  const hasIdentity = existingContacts.length > 0;
  const platformNames = (platformData?.data ?? []).map(
    (platform) => platform.name,
  );

  const selection = state.isNewContact
    ? NEW_CONTACT_OPTION
    : state.contactPlatform;

  const select = (value: string) => {
    if (value === NEW_CONTACT_OPTION) {
      update('isNewContact', true);
      update('contactPlatform', platformNames[0] ?? EMAIL_CONTACT_PLATFORM);
      update('contactValue', '');
      return;
    }
    const existing = existingContacts.find(
      (contact) => contact.platform === value,
    );
    update('isNewContact', false);
    update('contactPlatform', value);
    update('contactValue', existing?.value ?? '');
  };

  const showNewFields = !hasIdentity || state.isNewContact;
  const needsValue =
    showNewFields && state.contactPlatform !== EMAIL_CONTACT_PLATFORM;

  return {
    hasIdentity,
    existingContacts,
    email,
    platformNames,
    selection,
    select,
    showNewFields,
    needsValue,
    platform: state.contactPlatform,
    value: state.contactValue,
    setPlatform: (platform: string) => update('contactPlatform', platform),
    setValue: (value: string) => update('contactValue', value),
  };
}
