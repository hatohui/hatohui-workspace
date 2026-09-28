import { randomBytes, randomInt, scrypt, timingSafeEqual } from 'node:crypto';
import { PasscodeSource } from '@prisma/client';

function deriveKeyHex(
  password: string,
  saltHex: string,
  keylen: number,
): Promise<string> {
  return new Promise((resolve, reject) =>
    scrypt(password, Buffer.from(saltHex, 'hex'), keylen, (error, key) =>
      error ? reject(error) : resolve(key.toString('hex')),
    ),
  );
}

const KEY_LENGTH = 32;
const SALT_BYTES = 16;
const GENERATED_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const GENERATED_LENGTH = 8;
const NON_ALPHANUMERIC = /[^A-Z0-9]/g;

export function generatePasscode(): string {
  return Array.from(
    { length: GENERATED_LENGTH },
    () => GENERATED_ALPHABET[randomInt(GENERATED_ALPHABET.length)],
  ).join('');
}

export function normalizePasscode(
  passcode: string,
  source: PasscodeSource,
): string {
  const trimmed = passcode.trim();
  return source === PasscodeSource.GENERATED
    ? trimmed.toUpperCase().replace(NON_ALPHANUMERIC, '')
    : trimmed;
}

export async function hashPasscode(
  passcode: string,
  source: PasscodeSource,
): Promise<string> {
  const saltHex = randomBytes(SALT_BYTES).toString('hex');
  const keyHex = await deriveKeyHex(
    normalizePasscode(passcode, source),
    saltHex,
    KEY_LENGTH,
  );
  return `scrypt$${saltHex}$${keyHex}`;
}

export async function verifyPasscode(
  passcode: string,
  source: PasscodeSource,
  stored: string,
): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;
  const actualHex = await deriveKeyHex(
    normalizePasscode(passcode, source),
    saltHex,
    keyHex.length / 2,
  );
  return timingSafeEqual(
    Buffer.from(actualHex, 'hex'),
    Buffer.from(keyHex, 'hex'),
  );
}
