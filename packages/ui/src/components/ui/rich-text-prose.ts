// Shared node/mark styling for RichTextField (editable) and RichTextView
// (read-only) — both must render identically since the read view exists to
// prove the editor's output round-trips exactly.
export const RICH_TEXT_PROSE_CLASSES = [
  '[&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li_p]:mb-0',
  '[&_h1]:mt-2 [&_h1]:mb-1 [&_h1]:text-xl [&_h1]:font-semibold',
  '[&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold',
  '[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-semibold',
  '[&_strong]:font-semibold [&_em]:italic [&_s]:line-through',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]',
  '[&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0',
].join(' ');
