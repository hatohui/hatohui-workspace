function CategoryChips({ categories }: { categories: string[] }) {
  if (!categories.length) return null;
  return (
    <ul className="flex flex-wrap gap-1">
      {categories.map((category) => (
        <li
          key={category}
          className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary dark:bg-primary/15"
        >
          {category}
        </li>
      ))}
    </ul>
  );
}

export default CategoryChips;
