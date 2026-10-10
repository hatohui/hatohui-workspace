import { Sparkle } from 'lucide-react';

export function LandingFacts({ facts }: { facts: string[] }) {
  if (facts.length === 0) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-3 pb-16">
      {facts.map((fact, index) => (
        <li
          key={`${fact}-${index}`}
          data-landing="fact"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-sm transition-[rotate,scale] duration-300 odd:hover:-rotate-3 even:hover:rotate-3 hover:scale-110"
        >
          <Sparkle className="size-3.5 text-primary" aria-hidden />
          {fact}
        </li>
      ))}
    </ul>
  );
}
