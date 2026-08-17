import { EmailOutboxKind } from '@prisma/client';
import { APP_URL, SANS, SERIF } from '@/modules/cron/birthday.constants';

export interface BirthdayEmailParams {
  recipientName: string;
  friendName: string;
  friendHandle: string | null;
  friendAvatarUrl: string | null;
  subjectId: string;
  birthdayDate: string;
  birthdayTimezone: string;
  turningAge: number | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

interface Card {
  preheader: string;
  eyebrow: string;
  headline: string;
  badge: string | null;
  dateLine: string;
  whenNote: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  portraitName: string;
  portraitUrl: string | null;
  handle: string | null;
}

const TEMPLATES: Record<
  EmailOutboxKind,
  (params: BirthdayEmailParams) => RenderedEmail
> = {
  [EmailOutboxKind.SELF_BIRTHDAY]: (p) => ({
    subject: sanitizeSubject(`Happy birthday, ${p.recipientName}!`),
    html: layout({
      ...portrait(p),
      preheader:
        p.turningAge !== null
          ? `Turning ${p.turningAge} today. Hope it's a good one.`
          : "Today's the day. Hope it's a good one.",
      eyebrow: 'Your birthday',
      headline: `Happy birthday, ${p.friendName}`,
      badge: levelBadge(p.turningAge),
      dateLine: p.birthdayDate,
      whenNote: `Today in your timezone (${zoneLabel(p.birthdayTimezone)})`,
      body:
        p.turningAge !== null
          ? `Here's to ${p.turningAge} — have a great one.`
          : "Here's to another great year.",
      ctaLabel: "See who's celebrating",
      ctaUrl: `https://${APP_URL}/birthdays`,
    }),
  }),

  [EmailOutboxKind.FRIEND_BIRTHDAY_TODAY]: (p) => ({
    subject: sanitizeSubject(`It's ${p.friendName}'s birthday today`),
    html: layout({
      ...portrait(p),
      preheader: `Today in ${zoneLabel(p.birthdayTimezone)} — a good moment to say something.`,
      eyebrow: 'Birthday today',
      headline: p.friendName,
      badge: levelBadge(p.turningAge),
      dateLine: p.birthdayDate,
      whenNote: `Today in their timezone (${zoneLabel(p.birthdayTimezone)})`,
      body: `It's ${p.friendName}'s day where they are. A quick hello goes a long way.`,
      ctaLabel: 'See their profile',
      ctaUrl: profileUrl(p.subjectId),
    }),
  }),

  /// No level badge here: the birthday hasn't happened yet, so claiming the
  /// level-up on a "coming up" email would be a day or more early.
  [EmailOutboxKind.FRIEND_BIRTHDAY_UPCOMING]: (p) => ({
    subject: sanitizeSubject(`${p.friendName}'s birthday is coming up`),
    html: layout({
      ...portrait(p),
      preheader: `${p.birthdayDate} — a heads-up so it doesn't sneak past you.`,
      eyebrow: 'Upcoming birthday',
      headline: p.friendName,
      badge: null,
      dateLine: p.birthdayDate,
      whenNote: `In their timezone (${zoneLabel(p.birthdayTimezone)})`,
      body: `A heads-up so the day doesn't sneak past you.${
        p.turningAge !== null ? ` They're turning ${p.turningAge}.` : ''
      }`,
      ctaLabel: 'See their profile',
      ctaUrl: profileUrl(p.subjectId),
    }),
  }),
};

export function renderBirthdayEmail(
  kind: EmailOutboxKind,
  params: BirthdayEmailParams,
): RenderedEmail {
  return TEMPLATES[kind](params);
}

/// The portrait is always the person whose birthday it is, even in
/// SELF_BIRTHDAY where that happens to be the recipient too.
function portrait(
  p: BirthdayEmailParams,
): Pick<Card, 'portraitName' | 'portraitUrl' | 'handle'> {
  return {
    portraitName: p.friendName,
    portraitUrl: safeUrl(p.friendAvatarUrl),
    handle: p.friendHandle,
  };
}

function levelBadge(turningAge: number | null): string {
  return turningAge !== null ? `Level ${turningAge}` : '+1 Level';
}

function profileUrl(subjectId: string): string {
  return `https://${APP_URL}/profile/${encodeURIComponent(subjectId)}`;
}

function zoneLabel(timezone: string): string {
  return timezone.replaceAll('_', ' ');
}

/// Every decorative element is a background-filled table cell rather than an
/// inline SVG or a hosted image: Gmail, Outlook and Yahoo all strip <svg>, and
/// there is no upload target in this repo for a raster fallback.
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
                ${eyebrow(card.eyebrow)}
                ${portraitBlock(card)}
                <h1 class="headline" style="margin:18px 0 0;font-family:${SERIF};font-size:28px;font-weight:400;line-height:1.2;letter-spacing:-0.3px;color:#141413;">${escapeHtml(card.headline)}</h1>
                ${handleLine(card.handle)}
                ${badgeBlock(card.badge)}
                ${dateBlock(card)}
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

function eyebrow(text: string): string {
  return `<p style="margin:0 0 20px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#5f5d57;">${escapeHtml(text)}</p>`;
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

function badgeBlock(badge: string | null): string {
  if (!badge) return '';
  return `
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:14px auto 0;">
      <tr>
        <td bgcolor="#a9583e" style="background-color:#a9583e;border-radius:999px;padding:6px 16px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ffffff;">${escapeHtml(badge)}</td>
      </tr>
    </table>`;
}

function dateBlock(card: Card): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
      <tr>
        <td align="center" bgcolor="#e8e0d2" style="background-color:#e8e0d2;border-radius:8px;padding:16px 20px;">
          <p style="margin:0;font-family:${SERIF};font-size:19px;line-height:1.3;color:#141413;">${escapeHtml(card.dateLine)}</p>
          <p style="margin:6px 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:#5f5d57;">${escapeHtml(card.whenNote)}</p>
        </td>
      </tr>
    </table>`;
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
            automated with love from <a href="https://${APP_URL}" style="color:#6c6a64;text-decoration:underline;">${APP_URL}</a>
          </p>
        </td>
      </tr>
    </table>`;
}

/// Array.from, not [0]: a display name starting outside the BMP would
/// otherwise render as half a surrogate pair.
function initial(name: string): string {
  return (Array.from(name.trim())[0] ?? '?').toUpperCase();
}

function safeUrl(value: string | null): string | null {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : null;
}

/// NFC first: names entered on macOS/iOS arrive decomposed, and a combining
/// mark renders displaced in many mail clients even when the font has the
/// precomposed glyph.
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
