const routes = {
  dashboard: '/',
  birthdays: '/birthdays',
  newFriend: '/friends/new',
  friend: (id: string) => `/friends/${id}`,
  editFriend: (id: string) => `/friends/${id}/edit`,
};

export default routes;
