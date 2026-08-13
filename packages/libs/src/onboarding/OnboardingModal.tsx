import { Dialog, DialogContent } from '@hatohui/ui';
import { useOnboardingModal } from './useOnboardingModal';
import OnboardingWizard from './OnboardingWizard';
import type { OnboardingMode } from './onboardingStep';

type Props = {
  mode?: OnboardingMode;
  onEntityChanged?: () => void;
};

function OnboardingModal({ mode, onEntityChanged }: Props) {
  const { isOpen } = useOnboardingModal();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <OnboardingWizard mode={mode} onEntityChanged={onEntityChanged} />
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingModal;
