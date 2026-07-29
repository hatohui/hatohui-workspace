import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { useAddMyself } from '../hooks/useAddMyself';

function AddMyselfButton() {
  const { t } = useTranslation();
  const { isAssociated, isLoading, addMyself } = useAddMyself();

  if (isLoading || isAssociated) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="link"
      className="w-fit p-0"
      onClick={addMyself}
    >
      {t('friendForm.addMyself')}
    </Button>
  );
}

export default AddMyselfButton;
