export function OpeningFieldHint({
  error,
  hint,
}: {
  error: string | null;
  hint: string;
}) {
  return error ? (
    <p className="text-xs text-destructive" role="alert">
      {error}
    </p>
  ) : (
    <p className="text-xs text-muted-foreground">{hint}</p>
  );
}
