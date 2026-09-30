import { QueueStage } from '@hatohui/models';

export const QUEUE_STAGE_ORDER: QueueStage[] = [
  QueueStage.WAITING,
  QueueStage.SKETCHING,
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

export const QUEUE_PASSCODE_INPUT_ID = 'queue-passcode';
export const QUEUE_UNLOCK_SHEET_CLASS =
  'sm:max-w-md max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:zoom-out-100 max-sm:data-[state=closed]:slide-out-to-bottom';
