import { mapsEmbedUrl, type MapTarget } from '../../lib/mapsEmbedUrl';

interface Props {
  target: MapTarget | null;
  title: string;
  className?: string;
}

function MapFrame({ target, title, className }: Props) {
  const src = target ? mapsEmbedUrl(target) : null;
  if (!src) return null;
  return (
    <iframe
      title={title}
      src={src}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      className={`w-full rounded-xl border-0 bg-card ${className ?? 'aspect-video'}`}
    />
  );
}

export default MapFrame;
