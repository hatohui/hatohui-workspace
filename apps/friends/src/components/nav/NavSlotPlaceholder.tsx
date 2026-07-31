interface Props {
  className?: string;
}

function NavSlotPlaceholder({ className = '' }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-full bg-muted ${className}`}
    />
  );
}

export default NavSlotPlaceholder;
