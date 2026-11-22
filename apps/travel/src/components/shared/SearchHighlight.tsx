import { Fragment } from 'react';
import { findHighlightRanges } from '@hatohui/tools';

interface Props {
  text: string;
  query: string;
}

function SearchHighlight({ text, query }: Props) {
  const ranges = findHighlightRanges(text, query);
  if (!ranges.length) return <>{text}</>;

  const parts: Array<{ text: string; highlight: boolean }> = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) {
      parts.push({ text: text.slice(cursor, start), highlight: false });
    }
    parts.push({ text: text.slice(start, end), highlight: true });
    cursor = end;
  }
  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), highlight: false });
  }

  return (
    <>
      {parts.map((part, index) =>
        part.highlight ? (
          <span key={index} className="font-semibold text-primary">
            {part.text}
          </span>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}

export default SearchHighlight;
