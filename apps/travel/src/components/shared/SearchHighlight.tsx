interface Props {
  text: string;
  query: string;
}

function SearchHighlight({ text, query }: Props) {
  const trimmed = query.trim();
  const at = trimmed ? text.toLowerCase().indexOf(trimmed.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="font-semibold text-primary">
        {text.slice(at, at + trimmed.length)}
      </span>
      {text.slice(at + trimmed.length)}
    </>
  );
}

export default SearchHighlight;
