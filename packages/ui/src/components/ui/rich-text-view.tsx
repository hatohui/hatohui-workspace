import * as React from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { cn } from '../../lib/utils';

export interface RichTextViewProps {
  value: JSONContent;
  className?: string;
}

function RichTextView({ value, className }: RichTextViewProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable: false,
  });

  React.useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  return (
    <div
      data-slot="rich-text-view"
      className={cn(
        'text-sm leading-relaxed',
        '[&_p]:mb-2 [&_p:last-child]:mb-0',
        '[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5',
        '[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_strong]:font-semibold [&_em]:italic',
        '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5',
        className,
      )}
    >
      <EditorContent editor={editor} />
    </div>
  );
}

export { RichTextView };
