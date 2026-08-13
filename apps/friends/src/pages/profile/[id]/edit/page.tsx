import { useNavigate, useParams } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { ErrorState, LoadingDots } from '@hatohui/ui';
import { useFriend } from '../../../../hooks/useFriend';
import { useUpdateFriend } from '../../../../hooks/useUpdateFriend';
import FriendForm from '../../../../components/FriendForm';
import RequireAuth from '../../../../components/RequireAuth';
import routes from '../../../../constants/routes';

function EditFriendPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useFriend(id ?? '');
  const updateFriend = useUpdateFriend();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingDots label={t('common:loading')} />
      </div>
    );
  }
  if (isError || !data || !id) {
    return (
      <ErrorState
        message={t('common:loadError')}
        retry={{ label: t('common:retry'), onClick: () => void refetch() }}
        back={{
          label: t('common:back'),
          onClick: () => void navigate(routes.dashboard),
        }}
      />
    );
  }

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
