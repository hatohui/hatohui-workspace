export function LandingName({ name }: { name: string }) {
  return (
    <h1 aria-label={name} className="font-serif text-5xl sm:text-7xl">
      {name.split(' ').map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          aria-hidden
          className="inline-block overflow-hidden pb-2 whitespace-nowrap not-last:mr-[0.25em]"
        >
          {Array.from(word).map((letter, letterIndex) => (
            <span
              key={`${letter}-${letterIndex}`}
              data-landing="letter"
              className="inline-block"
            >
              {letter}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
