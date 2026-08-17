/// How the viewer stands relative to another account. Directional from the
/// viewer's point of view, so the UI can tell "I asked them" from "they asked
/// me" without knowing which column each id sits in.
export const CONNECTION_STATES = [
  'NONE',
  'PENDING_OUTGOING',
  'PENDING_INCOMING',
  'ACCEPTED',
] as const;
export type ConnectionState = (typeof CONNECTION_STATES)[number];

export const CONNECTION_CONTEXT_TTL_SECONDS = 600;
