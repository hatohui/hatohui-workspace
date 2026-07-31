const routes = {
  dashboard: '/',
  birthdays: '/birthdays',
  social: '/social',
  profile: '/profile',
  account: '/account',
  newFriend: '/friends/new',
  friend: (id: string) => `/profile/${id}`,
  editFriend: (id: string) => `/profile/${id}/edit`,
};

export default routes;
