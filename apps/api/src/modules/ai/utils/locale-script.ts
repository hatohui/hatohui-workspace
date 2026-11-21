import {
  type AiLocale,
  CJK_SCRIPT_RE,
  KANA_SCRIPT_RE,
  SENTENCE_THRESHOLD_CHARS,
  VIETNAMESE_DIACRITICS_RE,
} from '@/modules/ai/ai.constants';

export function isTextInLocaleScript(
  text: string,
  locale: AiLocale,
  isSentence = text.trim().length >= SENTENCE_THRESHOLD_CHARS,
): boolean {
  switch (locale) {
    case 'zh':
      return CJK_SCRIPT_RE.test(text) && !KANA_SCRIPT_RE.test(text);
    case 'ja':
      return isSentence
        ? KANA_SCRIPT_RE.test(text)
        : KANA_SCRIPT_RE.test(text) || CJK_SCRIPT_RE.test(text);
    case 'vi':
      return (
        !CJK_SCRIPT_RE.test(text) &&
        !KANA_SCRIPT_RE.test(text) &&
        (!isSentence || VIETNAMESE_DIACRITICS_RE.test(text))
      );
    case 'en':
      return !CJK_SCRIPT_RE.test(text) && !KANA_SCRIPT_RE.test(text);
  }
}
