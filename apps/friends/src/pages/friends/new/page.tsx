import { useTranslation } from '@hatohui/i18n';
import { useCreateFriend } from '../../../hooks/useCreateFriend';
import FriendForm from '../../../components/FriendForm';

function NewFriendPage() {
  const { t } = useTranslation();
  const createFriend = useCreateFriend();

  return (
    <FriendForm
      title={t('friendForm.createTitle')}
      submitLabel={t('friendForm.submitCreate')}
      submitting={createFriend.isPending}
      onSubmit={(dto) => createFriend.mutate({ data: dto })}
    />
  );
}

export default NewFriendPage;
