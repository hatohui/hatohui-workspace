import { useTranslation } from '@hatohui/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hatohui/ui';
import { Lock } from 'lucide-react';
import AreasAdmin from '../../components/admin/AreasAdmin';
import CountriesAdmin from '../../components/admin/CountriesAdmin';
import CuisinesAdmin from '../../components/admin/CuisinesAdmin';
import DishesAdmin from '../../components/admin/DishesAdmin';
import RecommendationsAdmin from '../../components/admin/RecommendationsAdmin';
import TagsAdmin from '../../components/admin/TagsAdmin';
import AddRecommendationButton from '../../components/catalog/AddRecommendationButton';
import EmptyState from '../../components/shared/EmptyState';
import { ADMIN_TAB_ICONS, ADMIN_TABS } from '../../constants/admin';
import { useCanEdit } from '../../hooks/useCanEdit';

const PANELS = {
  recommendations: RecommendationsAdmin,
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
    <Tabs defaultValue={ADMIN_TABS[0]}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          {ADMIN_TABS.map((tab) => {
            const Icon = ADMIN_TAB_ICONS[tab];
            return (
              <TabsTrigger key={tab} value={tab} className="gap-1.5">
                <Icon className="size-4" aria-hidden />
                {t(`admin.tabs.${tab}`)}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <AddRecommendationButton />
      </div>
      {ADMIN_TABS.map((tab) => {
        const Panel = PANELS[tab];
        return (
          <TabsContent key={tab} value={tab} className="pt-4">
            <Panel />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

export default AdminPage;
