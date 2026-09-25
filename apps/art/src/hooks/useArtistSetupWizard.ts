'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  getArtistSetupQueryKey,
  useArtistSetup,
  useDismissArtistSetup,
  type UpsertCommissionOpeningDto,
} from '@hatohui/models';
import {
  ARTIST_SETUP_STEPS,
  SETUP_STEP_PARAM,
  type ArtistSetupStep,
} from '@/constants/setup';
import { useCommissionOpeningsAdmin } from './useCommissionOpenings';
import { useCommissionTypesAdmin } from './useCommissionTypesAdmin';

const isStep = (value: string | null): value is ArtistSetupStep =>
  ARTIST_SETUP_STEPS.some((step) => step === value);

export function useArtistSetupWizard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setupQuery = useArtistSetup();
  const openings = useCommissionOpeningsAdmin();
  const types = useCommissionTypesAdmin();
  const dismiss = useDismissArtistSetup();

  const setup = setupQuery.data?.data;
  const requested = searchParams.get(SETUP_STEP_PARAM);
  const step: ArtistSetupStep = isStep(requested)
    ? requested
    : (setup?.nextStep ?? ARTIST_SETUP_STEPS[0]);
  const index = ARTIST_SETUP_STEPS.indexOf(step);
  const isLast = index === ARTIST_SETUP_STEPS.length - 1;

  const refresh = () =>
    void queryClient.invalidateQueries({ queryKey: getArtistSetupQueryKey() });

  const goTo = (next: ArtistSetupStep) => {
    refresh();
    router.replace(`${pathname}?${SETUP_STEP_PARAM}=${next}`, {
      scroll: false,
    });
  };

  return {
    isLoading: setupQuery.isPending,
    step,
    index,
    total: ARTIST_SETUP_STEPS.length,
    steps: ARTIST_SETUP_STEPS.map((key) => ({
      key,
      done: setup?.steps.find((row) => row.key === key)?.done ?? false,
      active: key === step,
    })),
    goTo,
    canGoBack: index > 0,
    isLast,
    back: () => goTo(ARTIST_SETUP_STEPS[Math.max(0, index - 1)]),
    next: () => goTo(ARTIST_SETUP_STEPS[index + 1] ?? step),
    skip: () => {
      dismiss.mutate();
      router.push('/app');
    },
    enabledTypes: types.items
      .filter((type) => type.enabled)
      .map((type) => ({
        id: type.commissionTypeId,
        key: type.key,
        label: type.label,
        tagName: type.tagName,
      })),
    openCommissions: async (dto: UpsertCommissionOpeningDto) => {
      await openings.create({ data: dto });
      refresh();
      router.push('/app/commissions');
    },
  };
}
