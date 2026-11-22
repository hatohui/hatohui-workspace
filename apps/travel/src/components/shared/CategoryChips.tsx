function CategoryChips({ categories }: { categories: string[] }) {
  if (!categories.length) return null;
  return (
    <ul className="flex flex-wrap gap-1">
      {categories.map((category) => (
        <li
          key={category}
          className="rounded-full bg-primary/15 px-1.5 py-px text-[11px] font-medium text-[#8f4429] dark:bg-primary/25 dark:text-[#e9a487]"
        >
          {category}
        </li>
      ))}
    </ul>
  );
}

export default CategoryChips;
