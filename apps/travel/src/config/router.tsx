// Next.js-style file-based router for react-router, built on import.meta.glob.
// Copy into src/router.tsx (or wherever the app wires its router) and adjust
// the glob base path ('../pages/**/...') to match that app's actual pages dir.
//
// Conventions this expects from src/pages/:
//   pages/page.tsx                -> "/"
//   pages/about/page.tsx          -> "/about"
//   pages/users/[id]/page.tsx     -> "/users/:id"
//   pages/(marketing)/page.tsx    -> route groups: "(group)" segments are stripped from the URL
//   pages/**/layout.tsx           -> wraps every page.tsx below it, nested layouts compose
//   pages/**/{not-found,error}.tsx -> nearest-ancestor error boundary for that subtree
//   pages/not-found.tsx           -> global catch-all (404 / uncaught error)

import { createBrowserRouter, Outlet, type RouteObject } from 'react-router';
import { ROUTE_PRELOAD_DELAY_MS } from '../constants/routes';
import type { ComponentType } from 'react';

type PageModule = { default: ComponentType<Record<string, unknown>> };
type GlobImport = Record<string, () => Promise<PageModule>>;

const pageLoaders = import.meta.glob('../pages/**/page.tsx') as GlobImport;
const layoutLoaders = import.meta.glob('../pages/**/layout.tsx') as GlobImport;
const errorLoaders = import.meta.glob(
  '../pages/**/{not-found,error}.tsx',
) as GlobImport;

// Every route chunk gets a new content hash on each deploy, so a tab left
// open across a deploy will 404 fetching its old chunk the next time it
// navigates. Reload once to pick up the new build; the sessionStorage flag
// stops a reload loop if the failure has some other cause (e.g. offline).
const CHUNK_RELOAD_FLAG = 'router:chunk-reload-attempted';

async function loadChunk<T>(loader: () => Promise<T>): Promise<T> {
  try {
    const mod = await loader();
    sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
    return mod;
  } catch (error) {
    if (sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
      throw error;
    }
    sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1');
    window.location.reload();
    return new Promise<T>(() => {
      // Reload is already in flight — never resolve into stale code.
    });
  }
}

const getRoutePath = (filename: string) => {
  let name = filename.replace(/^\.\.\/pages\//, '').replace(/\.tsx$/, '');
  name = name.replace(/\[(.+?)\]/g, ':$1');
  name = name.replace(/\/?\(([^)]+)\)/g, '');
  name = name.replace(/^\/+/, '');
  if (name === 'page') return '/';
  if (name.endsWith('/page'))
    return `/${name.replace('/page', '')}`.length
      ? `/${name.replace('/page', '')}`
      : '/';
  return `/${name}`;
};

const normalize = (key: string) => key.replace(/\\/g, '/');
const dirOf = (key: string) => normalize(key).replace(/[^/]+\.tsx$/, '');
const layoutKeys = Object.keys(layoutLoaders);
const errorKeys = Object.keys(errorLoaders);

const closest = (keys: string[], fileKey: string, exclude?: string) =>
  keys
    .filter(
      (key) => key !== exclude && normalize(fileKey).startsWith(dirOf(key)),
    )
    .sort((a, b) => dirOf(b).length - dirOf(a).length)[0] ?? null;

const pageRoute = (pageKey: string): RouteObject => ({
  path: getRoutePath(pageKey),
  lazy: async () => {
    const pageMod = await loadChunk(pageLoaders[pageKey]);
    const errorKey = closest(errorKeys, pageKey);
    if (!errorKey) return { Component: pageMod.default };
    const errorMod = await loadChunk(errorLoaders[errorKey]);
    return { Component: pageMod.default, ErrorBoundary: errorMod.default };
  },
});

const globalNotFoundKey = errorKeys.find(
  (key) =>
    normalize(key) === '../pages/not-found.tsx' ||
    normalize(key) === '../pages/error.tsx',
);

const notFoundRoute = (key: string): RouteObject => ({
  path: '*',
  lazy: async () => ({
    Component: (await loadChunk(errorLoaders[key])).default,
  }),
});

function childRoutes(parent: string | null): RouteObject[] {
  const layouts = layoutKeys
    .filter((key) => closest(layoutKeys, key, key) === parent)
    .map<RouteObject>((key) => ({
      id: normalize(key),
      lazy: async () => {
        const Layout = (await loadChunk(layoutLoaders[key])).default;
        return {
          Component: () => (
            <Layout>
              <Outlet />
            </Layout>
          ),
        };
      },
      children: childRoutes(key),
    }));
  const pages = Object.keys(pageLoaders)
    .filter((key) => closest(layoutKeys, key) === parent)
    .map(pageRoute);
  const notFound =
    globalNotFoundKey && closest(layoutKeys, globalNotFoundKey) === parent
      ? [notFoundRoute(globalNotFoundKey)]
      : [];
  return [...layouts, ...pages, ...notFound];
}

const router = createBrowserRouter(childRoutes(null), {
  future: { v7_startTransition: true },
});

const preloadRoutes = () => {
  for (const load of [
    ...Object.values(layoutLoaders),
    ...Object.values(pageLoaders),
  ]) {
    void load().catch(() => undefined);
  }
};

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadRoutes, {
      timeout: ROUTE_PRELOAD_DELAY_MS,
    });
  } else {
    setTimeout(preloadRoutes, ROUTE_PRELOAD_DELAY_MS);
  }
}

export default router;
