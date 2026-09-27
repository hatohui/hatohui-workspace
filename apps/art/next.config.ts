import type { NextConfig } from 'next';

const IMAGE_QUALITY = 90;
const assetPublicUrl = process.env.NEXT_PUBLIC_ASSET_URL;

if (!assetPublicUrl && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_ASSET_URL must be set at build time');
}

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
    qualities: [IMAGE_QUALITY],
    dangerouslyAllowLocalIP: parsedAssetUrl?.hostname === 'localhost',
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
