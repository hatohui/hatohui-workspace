import { useTranslation } from '@hatohui/i18n';
import type { TravelTagKind } from '@hatohui/models';
import { TAG_KINDS } from '../../constants/admin';
import { useAdminTags } from '../../hooks/useAdminTags';
import ChoiceChips from '../shared/ChoiceChips';
import AdminTable from './AdminTable';

function TagsAdmin() {
  const { t } = useTranslation();
  const admin = useAdminTags();

  const kindPicker = (
    <ChoiceChips<TravelTagKind>
      label={t('admin.kind')}
      value={admin.kind}
      onChange={admin.setKind}
      options={TAG_KINDS.map((kind) => ({
        value: kind,
        label: t(`admin.kinds.${kind}`),
      }))}
    />
  );

  return (
    <AdminTable
      storageKey="travel-admin-tags"
      addPlaceholder={t('admin.addTags')}
      deleteDescription={t('admin.deleteTag')}
      addControls={kindPicker}
      {...admin}
    />
  );
}

export default TagsAdmin;
