import { Dialog, DialogContent } from '@hatohui/ui';
import { useOnboardingModal } from '../../hooks/useOnboardingModal';
import OnboardingWizard from './OnboardingWizard';

function OnboardingModal() {
  const { isOpen } = useOnboardingModal();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <OnboardingWizard />
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingModal;
