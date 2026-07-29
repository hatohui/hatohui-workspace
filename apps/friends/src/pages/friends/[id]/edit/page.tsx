import { useParams } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useFriend } from '../../../../hooks/useFriend';
import { useUpdateFriend } from '../../../../hooks/useUpdateFriend';
import FriendForm from '../../../../components/FriendForm';
import RequireAuth from '../../../../components/RequireAuth';

function EditFriendPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useFriend(id ?? '');
  const updateFriend = useUpdateFriend();

  if (isLoading) return <p>{t('common:loading')}</p>;
  if (isError || !data || !id) return <p>{t('common:loadError')}</p>;

  return (
    <RequireAuth>
      <FriendForm
        title={t('friendForm.editTitle')}
        submitLabel={t('friendForm.submitEdit')}
        initialFriend={data.data}
        submitting={updateFriend.isPending}
        error={updateFriend.error}
        onSubmit={(dto) => updateFriend.mutate({ id, data: dto })}
      />
    </RequireAuth>
  );
}

export default EditFriendPage;
