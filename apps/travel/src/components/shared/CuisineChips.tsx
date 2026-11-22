function CuisineChips({ cuisines }: { cuisines: string[] }) {
  if (!cuisines.length) return null;
  return (
    <ul className="flex flex-wrap gap-1">
      {cuisines.map((cuisine) => (
        <li
          key={cuisine}
          className="rounded-full border border-border/70 bg-background/75 px-2 py-0.5 text-[11px] text-foreground/80 dark:bg-input/30"
        >
          {cuisine}
        </li>
      ))}
    </ul>
  );
}

export default CuisineChips;
