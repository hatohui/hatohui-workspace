import type { NextConfig } from 'next';

const assetPublicUrl = process.env.NEXT_PUBLIC_ASSET_URL;
const parsedAssetUrl = assetPublicUrl ? new URL(assetPublicUrl) : undefined;

const WORKSPACE_REDIRECTS: [string, string][] = [
  ['/admin', '/app/commissions'],
  ['/admin/commissions', '/app/commissions'],
  ['/admin/commissions/production', '/app/commissions?tab=queue'],
  ['/admin/commissions/:id', '/app/commissions/:id'],
  ['/admin/assets', '/app/gallery'],
  ['/admin/projects', '/app/projects'],
  ['/admin/groups', '/app/groups'],
  ['/admin/pricing', '/app/configure'],
  ['/app/requests', '/app/commissions'],
  ['/app/commission-opening', '/app/commissions'],
  ['/app/commissions/queue', '/app/commissions?tab=queue'],
  ['/app/commission-settings', '/app/configure'],
];

const nextConfig: NextConfig = {
  redirects() {
    return Promise.resolve(
      WORKSPACE_REDIRECTS.map(([source, destination]) => ({
        source,
        destination,
        permanent: false,
      })),
    );
  },
  images: {
    remotePatterns: parsedAssetUrl
      ? [
          {
            protocol: parsedAssetUrl.protocol.replace(':', '') as
              'http' | 'https',
            hostname: parsedAssetUrl.hostname,
            port: parsedAssetUrl.port || undefined,
          },
        ]
      : undefined,
  },
};

export default nextConfig;
