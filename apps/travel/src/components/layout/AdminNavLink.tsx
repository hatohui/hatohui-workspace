import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { TableProperties } from 'lucide-react';
import routes from '../../constants/routes';
import { useCanEdit } from '../../hooks/useCanEdit';

function AdminNavLink() {
  const { t } = useTranslation();
  const canEdit = useCanEdit();
  if (!canEdit) return null;
  return (
    <Button asChild variant="ghost" size="icon" className="rounded-full">
      <Link
        to={routes.admin}
        aria-label={t('nav.admin')}
        title={t('nav.admin')}
      >
        <TableProperties />
      </Link>
    </Button>
  );
}

export default AdminNavLink;
