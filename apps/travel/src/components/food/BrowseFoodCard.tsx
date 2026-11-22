import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { MapPin, Soup, UtensilsCrossed } from 'lucide-react';
import routes from '../../constants/routes';
import { useBrowseFoodImages } from '../../hooks/useBrowseFoodImages';

function BrowseFoodCard() {
  const { t } = useTranslation();
  const images = useBrowseFoodImages();

  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-card">
      <div className="absolute inset-0 -z-10 grid grid-cols-3" aria-hidden>
        {images.map((src) => (
          <img key={src} src={src} alt="" className="size-full object-cover" />
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/90 to-background/30" />
      <div className="flex min-h-48 flex-col justify-center gap-4 p-6 sm:min-h-56 sm:p-8">
        <div className="max-w-md space-y-1.5">
          <UtensilsCrossed className="size-6 text-primary" aria-hidden />
          <h2 className="text-2xl font-medium tracking-tight">
            {t('overview.browseFoodTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('overview.browseFoodBody')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full">
            <Link to={routes.dishes}>
              <Soup aria-hidden />
              {t('catalog.byDish')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to={routes.places}>
              <MapPin aria-hidden />
              {t('catalog.byPlace')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default BrowseFoodCard;
