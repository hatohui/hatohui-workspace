import * as React from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { cn } from '../../lib/utils';
import { RICH_TEXT_PROSE_CLASSES } from './rich-text-prose';

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
        RICH_TEXT_PROSE_CLASSES,
        className,
      )}
    >
      <EditorContent editor={editor} />
    </div>
  );
}

export { RichTextView };
