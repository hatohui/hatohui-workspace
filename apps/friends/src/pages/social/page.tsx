import { Network } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import RequireAuth from '../../components/auth/RequireAuth';
import SocialTree from '../../components/social/SocialTree';

function SocialPage() {
  const { t } = useTranslation();

  return (
    <RequireAuth>
      <h1 className="mb-6 flex items-center gap-2 text-3xl">
        <Network className="size-7 shrink-0" />
        {t('social.title')}
      </h1>
      <SocialTree />
    </RequireAuth>
  );
}

export default SocialPage;
