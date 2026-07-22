import { useParams } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useFriend } from '../../../hooks/useFriend';
import FriendDetail from '../../../components/FriendDetail';

function FriendDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useFriend(id ?? '');

  if (isLoading) return <p>{t('common:loading')}</p>;
  if (isError || !data) return <p>{t('common:loadError')}</p>;

  return <FriendDetail friend={data.data} />;
}

export default FriendDetailPage;
