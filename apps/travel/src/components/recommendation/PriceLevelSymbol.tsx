import type { TravelPriceLevel } from '@hatohui/models';
import { Banknote } from 'lucide-react';
import { PRICE_LEVEL_SYMBOLS } from '../../constants/travel';

function PriceLevelSymbol({ level }: { level: TravelPriceLevel }) {
  return (
    <span className="inline-flex" aria-hidden>
      {Array.from({ length: PRICE_LEVEL_SYMBOLS[level] }, (_, index) => (
        <Banknote key={index} className="size-3.5" />
      ))}
    </span>
  );
}

export default PriceLevelSymbol;
