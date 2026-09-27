export function CommissionFieldError({
  id,
  message,
  hint,
}: {
  id: string;
  message: string | null;
  hint?: string;
}) {
  if (message) {
    return (
      <p id={id} className="text-xs text-destructive" role="alert">
        {message}
      </p>
    );
  }

  if (!hint) return null;

  return (
    <p id={id} className="text-xs text-muted-foreground">
      {hint}
    </p>
  );
}
