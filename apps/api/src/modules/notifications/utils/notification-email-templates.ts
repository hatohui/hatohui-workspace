import { NotificationType } from '@prisma/client';
import { NOTIFICATION_APP_URL } from '@/modules/notifications/notifications.constants';

const SERIF =
  "'Palatino Linotype','Book Antiqua',Palatino,Constantia,'Times New Roman',serif";
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export interface NotificationEmailParams {
  recipientName: string;
  actorName: string | null;
  actorHandle: string | null;
  actorAvatarUrl: string | null;
  subjectId: string | null;
  data: Record<string, unknown> | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

interface Card {
  preheader: string;
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  portraitName: string;
  portraitUrl: string | null;
  handle: string | null;
}

const NOTIFICATIONS_URL = `https://${NOTIFICATION_APP_URL}/notifications`;

const TEMPLATES: Partial<
  Record<NotificationType, (p: NotificationEmailParams) => RenderedEmail | null>
> = {
  [NotificationType.CONNECTION_REQUEST]: (p) => {
    const who = p.actorName ?? 'Someone';
    return {
      subject: sanitizeSubject(
        `${who} wants to connect on ${NOTIFICATION_APP_URL}`,
      ),
      html: layout({
        ...portrait(p),
        preheader: `${who} sent you a connection request.`,
        eyebrow: 'Connection request',
        headline: `${who} wants to connect`,
        body: `Open your notifications to accept or decline.`,
        ctaLabel: 'View request',
        ctaUrl: NOTIFICATIONS_URL,
      }),
    };
  },

  [NotificationType.CONNECTION_ACCEPTED]: (p) => {
    const who = p.actorName ?? 'Someone';
    return {
      subject: sanitizeSubject(`${who} accepted your connection request`),
      html: layout({
        ...portrait(p),
        preheader: `You and ${who} are now connected.`,
        eyebrow: 'Connection accepted',
        headline: `You're connected with ${who}`,
        body: `${who} accepted your connection request.`,
        ctaLabel: 'See your notifications',
        ctaUrl: NOTIFICATIONS_URL,
      }),
    };
  },

  [NotificationType.SYSTEM]: (p) => {
    const headline = stringField(p.data, 'title') ?? 'A new notification';
    const body =
      stringField(p.data, 'body') ??
      'Open your notifications to see what changed.';
    const ctaUrl = stringField(p.data, 'url') ?? NOTIFICATIONS_URL;
    return {
      subject: sanitizeSubject(headline),
      html: layout({
        portraitName: p.recipientName,
        portraitUrl: null,
        handle: null,
        preheader: body,
        eyebrow: 'Notification',
        headline,
        body,
        ctaLabel: 'Open notifications',
        ctaUrl: safeUrl(ctaUrl) ?? NOTIFICATIONS_URL,
      }),
    };
  },
};

export function renderNotificationEmail(
  type: NotificationType,
  params: NotificationEmailParams,
): RenderedEmail | null {
  return TEMPLATES[type]?.(params) ?? null;
}

function portrait(
  p: NotificationEmailParams,
): Pick<Card, 'portraitName' | 'portraitUrl' | 'handle'> {
  return {
    portraitName: p.actorName ?? p.recipientName,
    portraitUrl: safeUrl(p.actorAvatarUrl),
    handle: p.actorHandle,
  };
}

function stringField(
  data: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = data?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function layout(card: Card): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>${escapeHtml(card.headline)}</title>
    <style>
      @media only screen and (max-width: 480px) {
        .card-pad { padding: 24px 20px !important; }
        .headline { font-size: 24px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#faf9f5;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0;">
      ${escapeHtml(card.preheader)}
      ${'&#8203;'.repeat(60)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#faf9f5;">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;background-color:#efe9de;border-radius:12px;">
            <tr>
              <td style="height:4px;line-height:4px;font-size:0;background-color:#cc785c;border-radius:12px 12px 0 0;">&nbsp;</td>
            </tr>
            <tr>
              <td class="card-pad" align="center" style="padding:32px;">
                <p style="margin:0 0 20px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#5f5d57;">${escapeHtml(card.eyebrow)}</p>
                ${portraitBlock(card)}
                <h1 class="headline" style="margin:18px 0 0;font-family:${SERIF};font-size:28px;font-weight:400;line-height:1.2;letter-spacing:-0.3px;color:#141413;">${escapeHtml(card.headline)}</h1>
                ${handleLine(card.handle)}
                <p style="margin:20px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:#3d3d3a;">${escapeHtml(card.body)}</p>
                ${button(card.ctaLabel, card.ctaUrl)}
              </td>
            </tr>
          </table>
          ${footer()}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function portraitBlock(card: Card): string {
  const inner = card.portraitUrl
    ? `<img src="${escapeHtml(card.portraitUrl)}" width="88" height="88" alt="" style="display:block;width:88px;height:88px;border-radius:50%;object-fit:cover;" />`
    : `<span style="font-family:${SERIF};font-size:34px;line-height:88px;color:#a9583e;">${escapeHtml(initial(card.portraitName))}</span>`;

  return `
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td width="88" height="88" align="center" valign="middle" bgcolor="#e8e0d2" style="width:88px;height:88px;background-color:#e8e0d2;border:3px solid #cc785c;border-radius:50%;">${inner}</td>
      </tr>
    </table>`;
}

function handleLine(handle: string | null): string {
  if (!handle) return '';
  return `<p style="margin:6px 0 0;font-family:${SANS};font-size:13px;font-weight:600;color:#5f5d57;">@${escapeHtml(handle)}</p>`;
}

function button(label: string, url: string): string {
  return `
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
      <tr>
        <td align="center" bgcolor="#a9583e" style="background-color:#a9583e;border-radius:8px;">
          <a href="${escapeHtml(url)}" style="display:block;padding:14px 28px;font-family:${SANS};font-size:15px;font-weight:600;line-height:1.2;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}

function footer(): string {
  return `
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;">
      <tr>
        <td align="center" style="padding:16px 8px 0;">
          <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.5;color:#6c6a64;">
            automated with love from <a href="https://${NOTIFICATION_APP_URL}" style="color:#6c6a64;text-decoration:underline;">${NOTIFICATION_APP_URL}</a>
          </p>
        </td>
      </tr>
    </table>`;
}

function initial(name: string): string {
  return (Array.from(name.trim())[0] ?? '?').toUpperCase();
}

function safeUrl(value: string | null): string | null {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : null;
}

function escapeHtml(value: string): string {
  return value
    .normalize('NFC')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeSubject(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').slice(0, 255);
}
