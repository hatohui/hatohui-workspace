import {
  useEditor,
  EditorContent,
  type Editor,
  type JSONContent,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Toggle } from './toggle';

export interface RichTextFieldProps {
  id?: string;
  value: JSONContent;
  onChange: (value: JSONContent) => void;
  placeholder?: string;
  className?: string;
}

function RichTextField({
  id,
  value,
  onChange,
  placeholder,
  className,
}: RichTextFieldProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: 'focus:outline-none min-h-[7rem]',
      },
    },
    onUpdate: ({ editor: updated }) => onChange(updated.getJSON()),
  });

  return (
    <div
      data-slot="rich-text-field"
      className={cn(
        'w-full rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        className,
      )}
    >
      <RichTextToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className={cn(
          'min-h-20 w-full resize-y overflow-auto px-3 py-2 text-base md:text-sm',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
        )}
      />
    </div>
  );
}

function RichTextToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 border-b border-input px-1 py-1">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet list"
      >
        <List />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Numbered list"
      >
        <ListOrdered />
      </Toggle>
    </div>
  );
}

export { RichTextField };
