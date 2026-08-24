import {
  registerDecorator,
  type ValidationOptions,
  type ValidationArguments,
} from 'class-validator';

const MAX_TIPTAP_DOCUMENT_JSON_BYTES = 50_000;

interface TiptapNode {
  type: string;
  text?: string;
  content?: TiptapNode[];
}

function hasNonWhitespaceText(node: TiptapNode): boolean {
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text.trim().length > 0;
  }
  return (node.content ?? []).some(hasNonWhitespaceText);
}

export function isValidTiptapDocument(value: unknown): value is TiptapNode {
  if (typeof value !== 'object' || value === null) return false;
  const doc = value as TiptapNode;
  if (doc.type !== 'doc') return false;
  if (JSON.stringify(doc).length > MAX_TIPTAP_DOCUMENT_JSON_BYTES) return false;
  return hasNonWhitespaceText(doc);
}

export function IsTiptapDocument(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTiptapDocument',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) => isValidTiptapDocument(value),
        defaultMessage: (args?: ValidationArguments) =>
          `${args?.property ?? 'value'} must be a non-empty Tiptap/ProseMirror JSON document`,
      },
    });
  };
}
