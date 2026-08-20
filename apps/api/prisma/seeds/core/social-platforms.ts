import type { PrismaClient } from '@prisma/client';

export const socialPlatforms = [
  { key: 'x', name: 'X (Twitter)', baseUrl: 'https://x.com/' },
  { key: 'facebook', name: 'Facebook', baseUrl: 'https://facebook.com/' },
  { key: 'bluesky', name: 'Bluesky', baseUrl: 'https://bsky.app/profile/' },
  { key: 'discord', name: 'Discord', baseUrl: 'https://discord.com/users/' },
  { key: 'telegram', name: 'Telegram', baseUrl: 'https://t.me/' },
  { key: 'instagram', name: 'Instagram', baseUrl: 'https://instagram.com/' },
  {
    key: 'furaffinity',
    name: 'Furaffinity',
    baseUrl: 'https://furaffinity.net/user/',
  },
  { key: 'twitch', name: 'Twitch', baseUrl: 'https://twitch.tv/' },
];

export async function seedSocialPlatforms(prisma: PrismaClient) {
  for (const platform of socialPlatforms) {
    await prisma.socialPlatform.upsert({
      where: { key: platform.key },
      update: {},
      create: platform,
    });
  }
}
