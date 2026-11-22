import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { Plane } from 'lucide-react';
import PlanCreateForm from '../../../components/plans/PlanCreateForm';
import EmptyState from '../../../components/shared/EmptyState';
import { useCreateTravelPlanForm } from '../../../hooks/useTravelPlans';

function NewPlanPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const form = useCreateTravelPlanForm();

  if (!isLoading && !user) {
    return <EmptyState icon={Plane} message={t('plans.signInPrompt')} />;
  }

  return <PlanCreateForm {...form} />;
}

export default NewPlanPage;
