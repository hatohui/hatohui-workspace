import { useTranslation } from '@hatohui/i18n';
import {
  FOOD_VIEWS,
  FOOD_VIEW_OPTIONS,
  type FoodView,
} from '../../constants/food';
import ChoiceChips from '../shared/ChoiceChips';

interface Props {
  value: FoodView;
  onChange: (view: FoodView) => void;
}

function FoodViewSwitch({ value, onChange }: Props) {
  const { t } = useTranslation();
  const options = FOOD_VIEWS.map((view) => {
    const { labelKey, icon: Icon } = FOOD_VIEW_OPTIONS[view];
    return {
      value: view,
      label: (
        <>
          <Icon className="size-4" aria-hidden />
          {t(labelKey)}
        </>
      ),
    };
  });

  return (
    <ChoiceChips
      label={t('catalog.viewLabel')}
      options={options}
      value={value}
      onChange={onChange}
    />
  );
}

export default FoodViewSwitch;
