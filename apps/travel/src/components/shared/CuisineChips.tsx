function CuisineChips({ cuisines }: { cuisines: string[] }) {
  if (!cuisines.length) return null;
  return (
    <ul className="flex flex-wrap gap-1">
      {cuisines.map((cuisine) => (
        <li
          key={cuisine}
          className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
        >
          {cuisine}
        </li>
      ))}
    </ul>
  );
}

export default CuisineChips;
