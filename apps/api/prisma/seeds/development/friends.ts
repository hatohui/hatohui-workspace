import type { PrismaClient } from '@prisma/client';

const sampleFriends = [
  { name: 'Ava Chen', birthYear: 1996, birthMonth: 1, birthDay: 14 },
  { name: 'Ben Torres', birthYear: null, birthMonth: 1, birthDay: 28 },
  { name: 'Camille Dupont', birthYear: 1992, birthMonth: 2, birthDay: 9 },
  { name: 'Daichi Nakamura', birthYear: 1998, birthMonth: 3, birthDay: 21 },
  { name: 'Elena Petrova', birthYear: null, birthMonth: 4, birthDay: 3 },
  { name: "Finn O'Brien", birthYear: 1990, birthMonth: 4, birthDay: 30 },
  { name: 'Giang Nguyen', birthYear: 1995, birthMonth: 5, birthDay: 17 },
  {
    name: 'Hana Kobayashi',
    birthYear: 1999,
    birthMonth: 6,
    birthDay: 5,
    visibility: 'FRIENDS_ONLY' as const,
  },
  { name: 'Ivan Petrov', birthYear: null, birthMonth: 7, birthDay: 12 },
  { name: 'Jade Williams', birthYear: 1993, birthMonth: 7, birthDay: 26 },
  { name: 'Kenji Sato', birthYear: 1997, birthMonth: 8, birthDay: 8 },
  {
    name: 'Linh Tran',
    birthYear: 1994,
    birthMonth: 9,
    birthDay: 19,
    visibility: 'NONE' as const,
  },
  { name: 'Marco Rossi', birthYear: 1991, birthMonth: 10, birthDay: 2 },
  { name: 'Nadia Hassan', birthYear: null, birthMonth: 10, birthDay: 31 },
  { name: 'Owen Clarke', birthYear: 1996, birthMonth: 11, birthDay: 15 },
  { name: 'Priya Sharma', birthYear: 2000, birthMonth: 12, birthDay: 24 },
];

export async function seedFriends(prisma: PrismaClient) {
  for (const friend of sampleFriends) {
    const existing = await prisma.profile.findFirst({
      where: { displayName: friend.name },
    });
    if (existing) continue;

    await prisma.profile.create({
      data: {
        displayName: friend.name,
        birthday: {
          create: {
            year: friend.birthYear,
            month: friend.birthMonth,
            day: friend.birthDay,
            visibility: friend.visibility ?? 'PUBLIC',
          },
        },
      },
    });
  }
}
