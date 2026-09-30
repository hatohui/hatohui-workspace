import { Dialog, DialogContent } from '@hatohui/ui';
import { useOnboardingModal } from './useOnboardingModal';
import OnboardingWizard, {
  type OnboardingWizardProps,
} from './OnboardingWizard';

function OnboardingModal(props: OnboardingWizardProps) {
  const { isOpen } = useOnboardingModal();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <OnboardingWizard {...props} />
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingModal;
