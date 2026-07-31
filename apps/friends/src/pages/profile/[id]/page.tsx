import { useNavigate, useParams } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { ErrorState, LoadingDots } from '@hatohui/ui';
import { useFriend } from '../../../hooks/useFriend';
import FriendDetail from '../../../components/FriendDetail';
import routes from '../../../constants/routes';

function FriendDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useFriend(id ?? '');

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingDots label={t('common:loading')} />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <ErrorState
        message={t('common:loadError')}
        retry={{ label: t('common:retry'), onClick: () => void refetch() }}
        back={{
          label: t('common:back'),
          onClick: () => navigate(routes.dashboard),
        }}
      />
    );
  }

  return <FriendDetail friend={data.data} />;
}

export default FriendDetailPage;
