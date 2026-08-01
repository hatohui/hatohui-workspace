import type { NextConfig } from 'next';

const assetPublicUrl = process.env.NEXT_PUBLIC_ASSET_URL;
const parsedAssetUrl = assetPublicUrl ? new URL(assetPublicUrl) : undefined;

const nextConfig: NextConfig = {
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
