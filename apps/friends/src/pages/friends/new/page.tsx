import { useTranslation } from '@hatohui/i18n';
import { useCreateFriend } from '../../../hooks/useCreateFriend';
import FriendForm from '../../../components/FriendForm';
import RequireAuth from '../../../components/RequireAuth';
import AddMyselfButton from '../../../components/AddMyselfButton';

function NewFriendPage() {
  const { t } = useTranslation();
  const createFriend = useCreateFriend();

  return (
    <RequireAuth>
      <div className="flex flex-col gap-4">
        <AddMyselfButton />
        <FriendForm
          title={t('friendForm.createTitle')}
          submitLabel={t('friendForm.submitCreate')}
          submitting={createFriend.isPending}
          error={createFriend.error}
          onSubmit={(dto) => createFriend.mutate({ data: dto })}
        />
      </div>
    </RequireAuth>
  );
}

export default NewFriendPage;
