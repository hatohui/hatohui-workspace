import type { JSONContent } from '@tiptap/react';

export const EMPTY_TIPTAP_DOCUMENT: JSONContent = { type: 'doc', content: [] };

function hasNonWhitespaceText(node: JSONContent): boolean {
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text.trim().length > 0;
  }
  return (node.content ?? []).some(hasNonWhitespaceText);
}

export function isTiptapDocEmpty(doc: JSONContent | undefined): boolean {
  if (!doc) return true;
  return !hasNonWhitespaceText(doc);
}

export function tiptapToPlainText(doc: JSONContent | undefined): string {
  if (!doc) return '';
  const parts: string[] = [];
  const walk = (node: JSONContent) => {
    if (node.type === 'text' && typeof node.text === 'string') {
      parts.push(node.text);
    }
    for (const child of node.content ?? []) walk(child);
    if (node.type === 'paragraph' || node.type === 'heading') parts.push('\n');
  };
  walk(doc);
  return parts.join('').trim();
}
