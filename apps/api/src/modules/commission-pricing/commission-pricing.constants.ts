export const DEFAULT_CURRENCY = 'USD';

export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'NZD',
  'SGD',
  'VND',
  'THB',
  'PHP',
  'IDR',
  'MYR',
  'KRW',
  'CNY',
  'HKD',
  'TWD',
  'INR',
  'BRL',
  'MXN',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
