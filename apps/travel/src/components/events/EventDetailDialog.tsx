import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import type { TravelEventDto } from '@hatohui/models';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@hatohui/ui';
import { Calendar, ExternalLink, MapPin, Pencil } from 'lucide-react';
import routes from '../../constants/routes';
import { useCanEdit } from '../../hooks/useCanEdit';

interface EventDetailDialogProps {
  event: TravelEventDto | null;
  onClose: () => void;
}

function EventDetailDialog({ event, onClose }: EventDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isEditor = useCanEdit();

  if (!event) return null;

  const canModify =
    isEditor || Boolean(user && event.createdBy?.id === user.id);

  const fmt = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        {event.previewUrl && (
          <div className="aspect-[16/9] overflow-hidden rounded-lg bg-muted">
            <img
              src={event.previewUrl}
              alt={event.title}
              className="size-full object-cover"
            />
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4 shrink-0" aria-hidden />
            <span>
              {fmt.format(new Date(event.startAt))} –{' '}
              {fmt.format(new Date(event.endAt))}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span>{event.location}</span>
              {event.mapsUrl && (
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {t('recommendation.openMaps')}
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              )}
            </div>
          )}

          {event.description && (
            <p className="whitespace-pre-line text-foreground/90">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          {event.reference && (
            <Button asChild variant="outline" size="sm">
              <a href={event.reference} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" aria-hidden />
                {t('events.detail.openReference')}
              </a>
            </Button>
          )}
          {canModify && (
            <Button asChild variant="outline" size="sm">
              <Link to={routes.eventEdit(event.id)}>
                <Pencil className="size-3.5" aria-hidden />
                {t('events.detail.edit')}
              </Link>
            </Button>
          )}
          <Button size="sm" onClick={onClose}>
            {t('events.detail.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EventDetailDialog;
