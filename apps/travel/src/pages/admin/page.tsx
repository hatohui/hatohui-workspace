import { useTranslation } from '@hatohui/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hatohui/ui';
import { Lock } from 'lucide-react';
import AreasAdmin from '../../components/admin/AreasAdmin';
import CountriesAdmin from '../../components/admin/CountriesAdmin';
import CuisinesAdmin from '../../components/admin/CuisinesAdmin';
import DishesAdmin from '../../components/admin/DishesAdmin';
import EmptyState from '../../components/shared/EmptyState';
import TagsAdmin from '../../components/admin/TagsAdmin';
import PageHeading from '../../components/shared/PageHeading';
import { ADMIN_TABS } from '../../constants/admin';
import { useCanEdit } from '../../hooks/useCanEdit';

const PANELS = {
  countries: CountriesAdmin,
  areas: AreasAdmin,
  dishes: DishesAdmin,
  cuisines: CuisinesAdmin,
  tags: TagsAdmin,
};

function AdminPage() {
  const { t } = useTranslation();
  const canEdit = useCanEdit();
  if (!canEdit) {
    return <EmptyState icon={Lock} message={t('admin.noAccess')} />;
  }

  return (
    <div className="space-y-6">
      <PageHeading title={t('admin.title')} subtitle={t('admin.subtitle')} />
      <Tabs defaultValue={ADMIN_TABS[0]}>
        <TabsList>
          {ADMIN_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {t(`admin.tabs.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {ADMIN_TABS.map((tab) => {
          const Panel = PANELS[tab];
          return (
            <TabsContent key={tab} value={tab} className="pt-4">
              <Panel />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export default AdminPage;
