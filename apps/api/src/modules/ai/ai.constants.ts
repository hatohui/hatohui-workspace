export const AI_SUPPORTED_LOCALES = ['en', 'vi', 'zh', 'ja'] as const;

export type AiLocale = (typeof AI_SUPPORTED_LOCALES)[number];

export const AI_LOCALE_NAMES: Record<AiLocale, string> = {
  en: 'English',
  vi: 'Vietnamese',
  zh: 'Simplified Chinese',
  ja: 'Japanese',
};

export const AI_LOCALE_LEGEND = AI_SUPPORTED_LOCALES.map(
  (locale) => `${locale} is ${AI_LOCALE_NAMES[locale]}`,
).join(', ');

export const AI_DEFAULT_REGION = 'ap-southeast-1';
export const AI_DEFAULT_MODEL_ID = 'global.amazon.nova-2-lite-v1:0';
export const AI_DEFAULT_FALLBACK_MODEL_ID =
  'global.anthropic.claude-haiku-4-5-20251001-v1:0';
export const AI_DEFAULT_PRIMARY_RPM = 9;

export const AI_TOOL_NAME = 'submit';
export const AI_RPM_KEY_PREFIX = 'ai:rpm';
export const AI_RPM_KEY_TTL_SECONDS = 70;
export const AI_CONNECT_TIMEOUT_MS = 3_000;
export const AI_REQUEST_TIMEOUT_MS = 50_000;
export const AI_MAX_ATTEMPTS = 2;

export const AI_TRANSLATE_CALL = {
  timeoutMs: 20_000,
  maxTokens: 2_048,
  temperature: 0,
} as const;

export const AI_TRANSLATE_SYSTEM_INSTRUCTION = [
  'You translate food and travel catalog content naturally for travelers and diners.',
  `Always answer by calling the ${AI_TOOL_NAME} tool with every requested field in every requested locale.`,
  `Locale codes: ${AI_LOCALE_LEGEND}.`,
  'Translate dish names the way a native speaker expects to see them, keeping proper nouns and brand names intact.',
].join(' ');

export const CJK_SCRIPT_RE = /[\u4e00-\u9fff]/;
export const KANA_SCRIPT_RE = /[\u3040-\u30ff\uff66-\uff9f]/;
export const VIETNAMESE_DIACRITICS_RE =
  /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
export const SENTENCE_THRESHOLD_CHARS = 24;
