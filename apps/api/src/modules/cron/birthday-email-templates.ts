import { EmailOutboxKind } from '@prisma/client';

export interface BirthdayEmailParams {
  recipientName: string;
  friendName: string;
  friendHandle: string | null;
  friendAvatarUrl: string | null;
  birthdayDate: string;
  birthdayTimezone: string;
  turningAge: number | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const TEMPLATES: Record<
  EmailOutboxKind,
  (params: BirthdayEmailParams) => RenderedEmail
> = {
  [EmailOutboxKind.SELF_BIRTHDAY]: (p) => ({
    subject: sanitizeSubject(`Happy birthday, ${p.recipientName}!`),
    html: layout({
      heading: `Happy birthday, ${p.recipientName}!`,
      levelUp: levelUpBlock(p),
      body:
        p.turningAge !== null
          ? `Here's to ${p.turningAge} — have a great one.`
          : "Here's to another great year.",
    }),
  }),

  [EmailOutboxKind.FRIEND_BIRTHDAY_TODAY]: (p) => ({
    subject: sanitizeSubject(`It's ${p.friendName}'s birthday today`),
    html: layout({
      heading: `It's ${p.friendName}'s birthday today`,
      levelUp: levelUpBlock(p),
      body: friendBody(p, 'today, where they are — go say happy birthday.'),
    }),
  }),

  [EmailOutboxKind.FRIEND_BIRTHDAY_UPCOMING]: (p) => ({
    subject: sanitizeSubject(`${p.friendName}'s birthday is coming up`),
    html: layout({
      heading: `${p.friendName}'s birthday is coming up`,
      levelUp: levelUpBlock(p),
      body: friendBody(p, `on ${p.birthdayDate}.`),
    }),
  }),
};

export function renderBirthdayEmail(
  kind: EmailOutboxKind,
  params: BirthdayEmailParams,
): RenderedEmail {
  return TEMPLATES[kind](params);
}

function friendBody(p: BirthdayEmailParams, whenClause: string): string {
  const age = p.turningAge !== null ? ` They're turning ${p.turningAge}.` : '';
  return `${p.friendName}'s birthday is ${whenClause}${age}`;
}

/// The avatar/handle/level-up badge is the same block for all three kinds —
/// it's always about the person whose birthday it is (`friendName`), even in
/// SELF_BIRTHDAY where that happens to be the recipient too.
function levelUpBlock(p: BirthdayEmailParams): string {
  const avatar = p.friendAvatarUrl
    ? `<img src="${escapeAttr(p.friendAvatarUrl)}" width="72" height="72" alt="" style="display:block;width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid #cc785c;" />`
    : `<div style="width:72px;height:72px;border-radius:50%;border:3px solid #cc785c;background:#e8e0d2;"></div>`;
  const handle = p.friendHandle
    ? `<p style="margin:8px 0 0;font-size:13px;font-weight:600;color:#6c6a64;">@${escapeHtml(p.friendHandle)}</p>`
    : '';

  return `
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:20px auto;">
      <tr>
        <td align="center">
          ${avatar}
          ${handle}
          <div style="display:inline-block;margin-top:12px;padding:6px 18px;background:#cc785c;color:#ffffff;font-size:15px;font-weight:800;letter-spacing:0.5px;border-radius:999px;transform:rotate(-3deg);">
            +1 LEVEL!!!!!!
          </div>
        </td>
      </tr>
    </table>`;
}

/// Inline SVG rather than a hosted image: no upload target exists for it
/// (nothing in this repo has write access to the production asset CDN), and
/// inline markup means the card never depends on an external fetch succeeding.
const BANNER_SVG = `
<svg width="416" height="166" viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg" role="presentation" style="display:block;margin:0 auto 8px;">
  <defs>
    <radialGradient id="glow" cx="50%" cy="120%" r="75%">
      <stop offset="0%" stop-color="#f5d9c8"/>
      <stop offset="62%" stop-color="#efe9de"/>
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="600" height="240" fill="url(#glow)"/>
  <rect x="40" y="30" width="10" height="10" fill="#cc785c" transform="rotate(20 45 35)"/>
  <rect x="80" y="60" width="8" height="8" fill="#e8b04b" transform="rotate(-15 84 64)"/>
  <circle cx="130" cy="35" r="5" fill="#7fa87a"/>
  <rect x="510" y="40" width="9" height="9" fill="#cc785c" transform="rotate(35 514 44)"/>
  <circle cx="560" cy="70" r="6" fill="#e8b04b"/>
  <rect x="475" y="90" width="7" height="7" fill="#7fa87a" transform="rotate(10 478 93)"/>
  <circle cx="30" cy="100" r="4" fill="#cc785c"/>
  <rect x="550" y="130" width="8" height="8" fill="#7fa87a" transform="rotate(-25 554 134)"/>
  <circle cx="70" cy="140" r="5" fill="#e8b04b"/>
  <rect x="20" y="180" width="9" height="9" fill="#cc785c" transform="rotate(15 24 184)"/>
  <circle cx="575" cy="180" r="5" fill="#7fa87a"/>
  <rect x="490" y="200" width="7" height="7" fill="#e8b04b" transform="rotate(-10 493 203)"/>
  <g transform="translate(0,20)">
    <line x1="30" y1="60" x2="20" y2="130" stroke="#cc785c" stroke-width="2" opacity="0.5"/>
    <ellipse cx="30" cy="40" rx="18" ry="24" fill="#cc785c" opacity="0.85"/>
    <polygon points="26,62 34,62 30,72" fill="#cc785c" opacity="0.85"/>
    <ellipse cx="95" cy="150" rx="42" ry="34" fill="#e0a370"/>
    <circle cx="95" cy="95" r="38" fill="#e8b385"/>
    <polygon points="65,70 55,35 80,60" fill="#e0a370"/>
    <polygon points="65,70 60,45 78,63" fill="#faf3ec"/>
    <polygon points="125,70 135,35 110,60" fill="#e0a370"/>
    <polygon points="125,70 130,45 112,63" fill="#faf3ec"/>
    <ellipse cx="95" cy="108" rx="20" ry="16" fill="#faf3ec"/>
    <path d="M78 90 Q83 84 88 90" stroke="#141413" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M102 90 Q107 84 112 90" stroke="#141413" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="95" cy="106" rx="5" ry="4" fill="#141413"/>
    <path d="M85 114 Q95 122 105 114" stroke="#141413" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="76" cy="104" r="5" fill="#cc785c" opacity="0.35"/>
    <circle cx="114" cy="104" r="5" fill="#cc785c" opacity="0.35"/>
    <polygon points="95,30 75,68 115,68" fill="#7fa87a"/>
    <polygon points="95,30 87,50 103,50" fill="#e8b04b"/>
    <circle cx="95" cy="30" r="6" fill="#e8b04b"/>
    <circle cx="82" cy="60" r="3" fill="#faf9f5"/>
    <circle cx="108" cy="55" r="3" fill="#faf9f5"/>
    <circle cx="95" cy="45" r="3" fill="#faf9f5"/>
  </g>
  <g transform="translate(450,30)">
    <circle cx="30" cy="30" r="4" fill="#7fa87a"/>
    <rect x="110" y="40" width="7" height="7" fill="#cc785c" transform="rotate(20 113 43)"/>
    <ellipse cx="55" cy="60" rx="4" ry="7" fill="#e8b04b"/>
    <ellipse cx="75" cy="52" rx="4" ry="8" fill="#e8b04b"/>
    <ellipse cx="95" cy="60" rx="4" ry="7" fill="#e8b04b"/>
    <rect x="52" y="66" width="6" height="20" fill="#cc785c"/>
    <rect x="72" y="58" width="6" height="28" fill="#7fa87a"/>
    <rect x="92" y="66" width="6" height="20" fill="#cc785c"/>
    <rect x="35" y="86" width="80" height="34" rx="6" fill="#faf3ec" stroke="#e0a370" stroke-width="2"/>
    <circle cx="50" cy="103" r="4" fill="#cc785c"/>
    <circle cx="70" cy="98" r="4" fill="#7fa87a"/>
    <circle cx="90" cy="103" r="4" fill="#e8b04b"/>
    <circle cx="60" cy="110" r="4" fill="#e8b04b"/>
    <circle cx="100" cy="112" r="4" fill="#cc785c"/>
    <rect x="20" y="118" width="110" height="46" rx="8" fill="#e0a370"/>
    <rect x="20" y="118" width="110" height="10" rx="5" fill="#e8b385"/>
  </g>
  <g fill="#cc785c" opacity="0.28">
    <ellipse cx="235" cy="205" rx="6" ry="8"/>
    <ellipse cx="225" cy="195" rx="3" ry="4"/>
    <ellipse cx="233" cy="192" rx="3" ry="4"/>
    <ellipse cx="241" cy="194" rx="3" ry="4"/>
    <ellipse cx="270" cy="185" rx="6" ry="8"/>
    <ellipse cx="260" cy="175" rx="3" ry="4"/>
    <ellipse cx="268" cy="172" rx="3" ry="4"/>
    <ellipse cx="276" cy="174" rx="3" ry="4"/>
  </g>
</svg>`;

const APP_URL = 'friends.hatohui.com';

function layout({
  heading,
  levelUp,
  body,
}: {
  heading: string;
  levelUp: string;
  body: string;
}): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body style="margin:0;padding:32px 16px;background-color:#faf9f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#141413;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#efe9de;border-radius:12px;padding:32px;">
            <tr>
              <td align="center">
                ${BANNER_SVG}
                <h1 style="margin:0;font-size:20px;line-height:1.4;color:#141413;text-align:center;">${escapeHtml(heading)}</h1>
                ${levelUp}
                <p style="margin:0;font-size:15px;line-height:1.6;color:#141413;text-align:center;">${escapeHtml(body)}</p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#a09d96;text-align:center;">
            automated with love from <a href="https://${APP_URL}" style="color:#a09d96;">${APP_URL}</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

function sanitizeSubject(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').slice(0, 255);
}
