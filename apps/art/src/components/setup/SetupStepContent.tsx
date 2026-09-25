'use client';

import type { useArtistSetupWizard } from '@/hooks/useArtistSetupWizard';
import { CommissionArtSettingsSection } from '@/components/commission/CommissionArtSettingsSection';
import { CommissionTypesEditor } from '@/components/commission/CommissionTypesEditor';
import { OpeningForm } from '@/components/commission/opening/OpeningForm';
import { SetupExamplesStep } from './SetupExamplesStep';

export function SetupStepContent({
  wizard,
}: {
  wizard: ReturnType<typeof useArtistSetupWizard>;
}) {
  switch (wizard.step) {
    case 'payment':
      return <CommissionArtSettingsSection />;
    case 'pricing':
      return <CommissionTypesEditor />;
    case 'examples':
      return (
        <SetupExamplesStep
          types={wizard.enabledTypes}
          onBack={() => wizard.goTo('pricing')}
        />
      );
    case 'opening':
      return (
        <section className="rounded-lg border border-border p-6">
          <OpeningForm onSubmit={wizard.openCommissions} />
        </section>
      );
  }
}
