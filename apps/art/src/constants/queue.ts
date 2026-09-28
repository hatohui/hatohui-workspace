import { QueueStage } from '@hatohui/models';

export const QUEUE_STAGE_ORDER: QueueStage[] = [
  QueueStage.WAITING,
  QueueStage.SKETCHING,
  QueueStage.SKETCH_APPROVED,
  QueueStage.IN_PROGRESS,
];

export const PASSCODE_MIN_LENGTH = 4;
export const PASSCODE_MAX_LENGTH = 64;

export const HTTP_FORBIDDEN = 403;
export const HTTP_TOO_MANY_REQUESTS = 429;

export const PASSCODE_COPIED_FLASH_MS = 2000;

export const queueOrderPath = (artist: string, accessCode: string) =>
  `/${artist}/queue/${accessCode}`;
export const queuePath = (artist: string) => `/${artist}/queue`;
