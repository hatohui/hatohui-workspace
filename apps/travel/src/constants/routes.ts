const routes = {
  catalog: '/',
  dishes: '/dishes',
  places: '/places',
  admin: '/admin',
  dish: (id: string) => `/dishes/${id}`,
  place: (id: string) => `/places/${id}`,
};

export default routes;
