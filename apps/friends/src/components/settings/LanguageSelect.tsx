import { persistLocale, useTranslation } from '@hatohui/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { LANGUAGE_NAMES, SUPPORTED_LOCALES } from '../../config/i18n';

function LanguageSelect() {
  const { i18n } = useTranslation();

  const handleSelect = (locale: string) => {
    void i18n.changeLanguage(locale);
    persistLocale(locale);
  };

  return (
    <Select value={i18n.language} onValueChange={handleSelect}>
      <SelectTrigger className="w-full sm:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {LANGUAGE_NAMES[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default LanguageSelect;
