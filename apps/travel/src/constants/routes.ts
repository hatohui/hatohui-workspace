const routes = {
  catalog: '/',
  overview: '/overview',
  dishes: '/dishes',
  places: '/places',
  events: '/events',
  eventNew: '/events/new',
  eventEdit: (id: string) => `/events/${id}/edit`,
  plans: '/plans',
  planNew: '/plans/new',
  plan: (id: string) => `/plans/${id}`,
  sharePlan: (id: string) => `/share/p/${id}`,
  schedule: '/schedule',
  settings: '/settings',
  settingsLeave: '/settings/leave',
  settingsSchedule: '/settings/schedule',
  settingsHolidays: '/settings/holidays',
  admin: '/admin',
  dish: (id: string) => `/dishes/${id}`,
  place: (id: string) => `/places/${id}`,
};

export default routes;
