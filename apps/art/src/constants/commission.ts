import {
  CommissionDtoStatus,
  CommissionDtoPaymentStatus,
  CommissionOpeningDtoStatus,
} from '@hatohui/models';
import type { CommissionOpeningDto } from '@hatohui/models';

export const EMAIL_INPUT_PATTERN = String.raw`[^@\s]+@[^@\s]+\.[^@\s]+`;
export const EMAIL_REGEX = new RegExp(`^${EMAIL_INPUT_PATTERN}$`);

export const COMMISSION_STATUS_OPTIONS = Object.values(CommissionDtoStatus);
export const PAYMENT_STATUS_OPTIONS = Object.values(CommissionDtoPaymentStatus);

export const COMMISSION_KANBAN_COLUMNS: CommissionDtoStatus[] = [
  CommissionDtoStatus.ACCEPTED,
  CommissionDtoStatus.NOT_YET_STARTED,
  CommissionDtoStatus.QUEUED,
  CommissionDtoStatus.SKETCH,
  CommissionDtoStatus.CONFIRMED,
  CommissionDtoStatus.ONGOING,
];

export const COMMISSION_HUB_TABS = ['requests', 'queue', 'past'] as const;

export type CommissionListView = 'requests' | 'past';

export const COMMISSION_STEP_KEYS = [
  'ideaConfirmedAt',
  'sketchConfirmedAt',
  'paymentConfirmedAt',
  'lineDoneAt',
  'coloringDoneAt',
  'finishedAt',
] as const;
export type CommissionStepKey = (typeof COMMISSION_STEP_KEYS)[number];

export const COMMISSION_PAGE_SIZE = 20;

export const OPENING_ACTIVE_STATUSES: CommissionOpeningDto['status'][] = [
  CommissionOpeningDtoStatus.OPEN,
  CommissionOpeningDtoStatus.SCHEDULED,
];

export const OPENING_SAVED_FLASH_MS = 2500;
export const AUTOSAVE_SAVED_FLASH_MS = 2500;

export const PUBLIC_COMMISSION_QUERY_PREFIXES = [
  '/commission-pricing',
  '/commission-types/by-artist/',
] as const;

export const OPENING_END_MODES = ['MANUAL', 'SLOT_CAP', 'INDEFINITE'] as const;

export const PRICING_SECTIONS = ['types', 'addons', 'rushFee'] as const;

export const COMMISSION_PRICING_STALE_MS = 10 * 60 * 1000;

export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  NZD: 'New Zealand Dollar',
  SGD: 'Singapore Dollar',
  VND: 'Vietnamese Dong',
  THB: 'Thai Baht',
  PHP: 'Philippine Peso',
  IDR: 'Indonesian Rupiah',
  MYR: 'Malaysian Ringgit',
  KRW: 'South Korean Won',
  CNY: 'Chinese Yuan',
  HKD: 'Hong Kong Dollar',
  TWD: 'New Taiwan Dollar',
  INR: 'Indian Rupee',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_NAMES);

export const COMMISSION_SETTINGS_TABS = ['general', 'pricing'] as const;

export const EMAIL_CONTACT_PLATFORM = 'email';

export const NEW_CONTACT_OPTION = '__new__';

export const IDENTITY_MATCH_DEBOUNCE_MS = 600;

export const IDENTITY_MATCH_QUERY_KEY = 'commission-identity-match';

export const EMPTY_COMMISSION_IDEA: { type: string; content: never[] } = {
  type: 'doc',
  content: [],
};

export const COMMISSION_STATUS_TONES: Record<CommissionDtoStatus, string> = {
  PENDING: 'bg-primary/10 text-primary',
  ACCEPTED: 'bg-secondary text-secondary-foreground',
  DECLINED: 'bg-muted text-muted-foreground',
  NOT_YET_STARTED: 'bg-secondary text-secondary-foreground',
  QUEUED: 'bg-secondary text-secondary-foreground',
  SKETCH: 'bg-secondary text-secondary-foreground',
  CONFIRMED: 'bg-secondary text-secondary-foreground',
  ONGOING: 'bg-secondary text-secondary-foreground',
  COMPLETED: 'bg-muted text-foreground',
  CANCELLED: 'bg-muted text-muted-foreground',
};

export type CommissionTableColumn =
  | 'submitted'
  | 'client'
  | 'type'
  | 'deadline'
  | 'estimate'
  | 'price'
  | 'status'
  | 'actions';

export const COMMISSION_TABLE_COLUMNS: Record<
  CommissionListView,
  readonly CommissionTableColumn[]
> = {
  requests: ['submitted', 'client', 'type', 'deadline', 'estimate', 'actions'],
  past: ['submitted', 'client', 'type', 'price', 'status'],
};

export const COMMISSION_LIST_ORDERS = ['desc', 'asc'] as const;

export const EMPTY_VALUE = '-';

export const COMMISSION_GALLERY_PAGE_SIZE = 12;
export const COMMISSION_GALLERY_ROW_HEIGHT_CLASS =
  '[--gallery-row:120px] md:[--gallery-row:160px] xl:[--gallery-row:200px]';

export const LEADING_AT_PATTERN = /^@/;

export const COMMISSION_REQUIRED_FIELDS = [
  'clientName',
  'clientEmail',
  'contactValue',
  'idea',
  'deadline',
  'acceptTerms',
] as const;
export type CommissionRequiredField =
  (typeof COMMISSION_REQUIRED_FIELDS)[number];

export const REFERENCE_LINK_LIMIT = 10;
export const REFERENCE_LINK_PROTOCOLS = ['http:', 'https:'];
export const URL_PROTOCOL_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i;

export const COMMISSION_MIN_DEADLINE_DAYS = 3;
