import type { PrismaClient } from '@prisma/client';

export const paymentMethods = [
  { key: 'paypal', name: 'PayPal', no: 0 },
  { key: 'bank_transfer', name: 'Bank transfer', no: 1 },
  { key: 'wise', name: 'Wise', no: 2 },
  { key: 'revolut', name: 'Revolut', no: 3 },
  { key: 'kofi', name: 'Ko-fi', no: 4 },
  { key: 'card', name: 'Credit / debit card', no: 5 },
  { key: 'cash', name: 'Cash', no: 6 },
  { key: 'crypto', name: 'Cryptocurrency', no: 7 },
];

export async function seedPaymentMethods(prisma: PrismaClient) {
  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { key: method.key },
      update: {},
      create: method,
    });
  }
}
