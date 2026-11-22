import { useTranslation } from '@hatohui/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hatohui/ui';
import { Lock } from 'lucide-react';
import AreasAdmin from '../../components/admin/AreasAdmin';
import CountriesAdmin from '../../components/admin/CountriesAdmin';
import CuisinesAdmin from '../../components/admin/CuisinesAdmin';
import DishesAdmin from '../../components/admin/DishesAdmin';
import EventsAdmin from '../../components/admin/EventsAdmin';
import JobProfilesAdmin from '../../components/admin/JobProfilesAdmin';
import PlansAdmin from '../../components/admin/PlansAdmin';
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
    <Tabs defaultValue={ADMIN_TABS[0]} className="gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <TabsList className="gap-1 rounded-lg border border-border bg-muted/80 p-1">
          {ADMIN_TABS.map((tab) => {
            const Icon = ADMIN_TAB_ICONS[tab];
            return (
              <TabsTrigger
                key={tab}
                value={tab}
                className="mb-0 gap-1.5 rounded-md border-b-0 px-3 py-1.5 text-foreground/75 hover:bg-background/70 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
              >
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
          <TabsContent key={tab} value={tab}>
            <Panel />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

export default AdminPage;
