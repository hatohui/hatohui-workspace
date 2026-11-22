import { injectOgMetadata } from '../../_lib/og';

interface SharePlanPayload {
  id: string;
  from: string;
  to: string;
  leaveType: string;
  groupName: string;
  memberCount: number;
  sharerName: string;
  eventTitle: string | null;
  eventImageUrl: string | null;
  eventLocation: string | null;
}

interface PagesContext {
  params: { id?: string | string[] };
  request: Request;
  env: { API_BASE_URL?: string };
  next: () => Promise<Response>;
}

const DEFAULT_API_BASE = 'https://api.hatohui.com';

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const response = await context.next();
  const rawId = context.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return response;

  const apiBase = (context.env.API_BASE_URL || DEFAULT_API_BASE).replace(
    /\/+$/,
    '',
  );

  try {
    const res = await fetch(
      `${apiBase}/travel/participations/${encodeURIComponent(id)}/share`,
      { headers: { accept: 'application/json' } },
    );
    if (!res.ok) return response;

    const data = (await res.json()) as SharePlanPayload;
    const title = data.eventTitle
      ? `${data.groupName} — ${data.eventTitle}`
      : data.groupName;
    const dateRange = `${data.from.slice(0, 10)} to ${data.to.slice(0, 10)}`;
    const parts = [
      data.eventTitle ?? `Travel plan by ${data.sharerName}`,
      dateRange,
      data.eventLocation,
      data.memberCount > 1 ? `${data.memberCount} travellers` : null,
    ].filter(Boolean);

    return injectOgMetadata(response, {
      title,
      description: parts.join(' · '),
      url: context.request.url,
      siteName: 'Hatohui Travel',
      imageUrl: data.eventImageUrl,
    });
  } catch {
    return response;
  }
}
