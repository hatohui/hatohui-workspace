import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { CalendarRange } from 'lucide-react';
import EventForm from '../../../components/events/EventForm';
import EmptyState from '../../../components/shared/EmptyState';
import { useTravelEventForm } from '../../../hooks/useTravelEventForm';

function NewEventPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const form = useTravelEventForm();

  if (!isLoading && !user) {
    return (
      <EmptyState
        icon={CalendarRange}
        message={t('events.form.signInPrompt')}
      />
    );
  }

  return <EventForm {...form} />;
}

export default NewEventPage;
