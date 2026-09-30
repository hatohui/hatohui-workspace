const INLINE_IMAGE_PATTERN = /!\[[^\]]*\]\(([^)\s]*)\)/g;

export interface InlineImage {
  markdown: string;
  url: string;
}

export function inlineImagesOf(text: string): InlineImage[] {
  return [...text.matchAll(INLINE_IMAGE_PATTERN)].map((match) => ({
    markdown: match[0],
    url: match[1],
  }));
}

export function withoutMarkdown(text: string, markdown: string): string {
  return text.replace(markdown, '').replace(/\n{3,}/g, '\n\n');
}
