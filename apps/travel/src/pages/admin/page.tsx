import { useTranslation } from '@hatohui/i18n';
import { Tabs, TabsContent } from '@hatohui/ui';
import { Lock } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AreasAdmin from '../../components/admin/AreasAdmin';
import CountriesAdmin from '../../components/admin/CountriesAdmin';
import CuisinesAdmin from '../../components/admin/CuisinesAdmin';
import DishesAdmin from '../../components/admin/DishesAdmin';
import EventsAdmin from '../../components/admin/EventsAdmin';
import FoodCategoriesAdmin from '../../components/admin/FoodCategoriesAdmin';
import JobProfilesAdmin from '../../components/admin/JobProfilesAdmin';
import PlaceCategoriesAdmin from '../../components/admin/PlaceCategoriesAdmin';
import PlacesAdmin from '../../components/admin/PlacesAdmin';
import PlansAdmin from '../../components/admin/PlansAdmin';
import RecommendationsAdmin from '../../components/admin/RecommendationsAdmin';
import TagsAdmin from '../../components/admin/TagsAdmin';
import EmptyState from '../../components/shared/EmptyState';
import { ADMIN_TABS } from '../../constants/admin';
import { useCanEdit } from '../../hooks/useCanEdit';

const PANELS = {
  recommendations: RecommendationsAdmin,
  countries: CountriesAdmin,
  areas: AreasAdmin,
  dishes: DishesAdmin,
  foodCategories: FoodCategoriesAdmin,
  places: PlacesAdmin,
  placeCategories: PlaceCategoriesAdmin,
  cuisines: CuisinesAdmin,
  tags: TagsAdmin,
  events: EventsAdmin,
  plans: PlansAdmin,
  jobProfiles: JobProfilesAdmin,
};

function AdminPage() {
  const { t } = useTranslation();
  const canEdit = useCanEdit();
  if (!canEdit) {
    return <EmptyState icon={Lock} message={t('admin.noAccess')} />;
  }

  return (
    <Tabs
      orientation="vertical"
      defaultValue={ADMIN_TABS[0]}
      className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start"
    >
      <AdminSidebar />
      <div className="min-w-0">
        {ADMIN_TABS.map((tab) => {
          const Panel = PANELS[tab];
          return (
            <TabsContent key={tab} value={tab}>
              <Panel />
            </TabsContent>
          );
        })}
      </div>
    </Tabs>
  );
}

export default AdminPage;
