const routes = {
  catalog: '/',
  dishes: '/dishes',
  places: '/places',
  dish: (id: string) => `/dishes/${id}`,
  place: (id: string) => `/places/${id}`,
};

export default routes;
