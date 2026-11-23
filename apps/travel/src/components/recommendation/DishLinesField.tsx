import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Plus } from 'lucide-react';
import type { useRecommendationForm } from '../../hooks/useRecommendationForm';
import DishLineRow from './DishLineRow';

interface Props {
  form: ReturnType<typeof useRecommendationForm>;
}

function DishLinesField({ form }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {form.lines.map((line, index) => (
        <DishLineRow
          key={line.key}
          line={line}
          index={index}
          total={form.lines.length}
          onChange={(patch) => form.updateLine(line.key, patch)}
          onRemove={() => form.removeLine(line.key)}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={form.addLine}
      >
        <Plus />
        {t('form.addDish')}
      </Button>
    </div>
  );
}

export default DishLinesField;
