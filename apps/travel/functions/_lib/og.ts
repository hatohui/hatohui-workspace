interface HtmlRewriterElement {
  setInnerContent(content: string): void;
  append(content: string, options?: { html?: boolean }): void;
}

interface HtmlRewriterInstance {
  on(
    selector: string,
    handlers: { element(el: HtmlRewriterElement): void },
  ): HtmlRewriterInstance;
  transform(response: Response): Response;
}

declare const HTMLRewriter: (new () => HtmlRewriterInstance) | undefined;

export interface OgMetadata {
  title: string;
  description: string;
  url: string;
  siteName: string;
  imageUrl?: string | null;
}

function escapeAttr(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildMetaTags(meta: OgMetadata): string {
  const tags = [
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeAttr(meta.siteName)}" />`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(meta.url)}" />`,
    `<meta name="twitter:card" content="${meta.imageUrl ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
  ];

  if (meta.imageUrl) {
    tags.push(
      `<meta property="og:image" content="${escapeAttr(meta.imageUrl)}" />`,
      `<meta name="twitter:image" content="${escapeAttr(meta.imageUrl)}" />`,
    );
  }

  return tags.join('\n    ');
}

export function injectOgMetadata(
  response: Response,
  meta: OgMetadata,
): Response {
  if (typeof HTMLRewriter === 'undefined') {
    return response;
  }

  return new HTMLRewriter()
    .on('title', {
      element(el) {
        el.setInnerContent(meta.title);
      },
    })
    .on('head', {
      element(el) {
        el.append(`\n    ${buildMetaTags(meta)}\n`, { html: true });
      },
    })
    .transform(response);
}
