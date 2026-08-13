const routes = {
  dashboard: '/',
  birthdays: '/birthdays',
  social: '/social',
  notifications: '/notifications',
  profile: '/profile',
  account: '/account',
  newFriend: '/friends/new',
  friend: (id: string) => `/profile/${id}`,
  editFriend: (id: string) => `/profile/${id}/edit`,
};

export default routes;
