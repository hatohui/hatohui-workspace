import { useTranslation } from '@hatohui/i18n';
import { TabsList, TabsTrigger } from '@hatohui/ui';
import { ADMIN_TAB_ICONS, ADMIN_TABS } from '../../constants/admin';

function AdminSidebar() {
  const { t } = useTranslation();

  return (
    <aside className="lg:sticky lg:top-20">
      <TabsList className="flex flex-row gap-1 overflow-x-auto border-b border-border pb-2 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0 lg:pr-3 lg:pb-0">
        {ADMIN_TABS.map((tab) => {
          const Icon = ADMIN_TAB_ICONS[tab];
          return (
            <TabsTrigger
              key={tab}
              value={tab}
              className="mb-0 shrink-0 justify-start gap-2.5 rounded-lg border-b-0 px-3 py-2 text-sm font-medium text-foreground/75 hover:bg-muted/80 hover:text-foreground data-[state=active]:bg-primary/15 data-[state=active]:text-[#8f4429] lg:w-full dark:data-[state=active]:bg-primary/25 dark:data-[state=active]:text-[#e9a487]"
            >
              <Icon className="size-4" aria-hidden />
              {t(`admin.tabs.${tab}`)}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </aside>
  );
}

export default AdminSidebar;
