import { useTranslation } from '@hatohui/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { GROUP_OPTIONS, type GroupOption } from '../../constants/directoryView';

type Props = {
  group: GroupOption;
  onGroupChange: (value: GroupOption) => void;
};

function DirectoryGroupSelect({ group, onGroupChange }: Props) {
  const { t } = useTranslation();

  return (
    <Select
      value={group}
      onValueChange={(v) => onGroupChange(v as GroupOption)}
    >
      <SelectTrigger className="h-9 w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {GROUP_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {t(`dashboard.groupBy.${option}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default DirectoryGroupSelect;
