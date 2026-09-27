import type { AssetDto } from '@hatohui/models';

export function ArtworkHeading({ asset }: { asset: AssetDto }) {
  if (!asset.title && !asset.description) return null;

  return (
    <div className="space-y-2">
      {asset.title && <h1 className="font-serif text-3xl">{asset.title}</h1>}
      {asset.description && (
        <p className="max-w-3xl whitespace-pre-line text-muted-foreground">
          {asset.description}
        </p>
      )}
    </div>
  );
}
