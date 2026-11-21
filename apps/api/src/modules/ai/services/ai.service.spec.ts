import type { ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import type { ConfigService } from '@nestjs/config';
import type { RedisClient } from '@/infra/redis';
import type { Env } from '@/config/env';
import { AiService } from '@/modules/ai/services/ai.service';

describe('AiService', () => {
  let service: AiService;
  let sendMock: jest.Mock<Promise<unknown>, [ConverseCommand, unknown]>;
  let incrMock: jest.Mock;
  let expireMock: jest.Mock;

  beforeEach(() => {
    incrMock = jest.fn().mockResolvedValue(1);
    expireMock = jest.fn().mockResolvedValue(1);
    sendMock = jest.fn<Promise<unknown>, [ConverseCommand, unknown]>();

    const config = {
      get: jest.fn((key: keyof Env) => {
        if (key === 'AI_PRIMARY_RPM') return 2;
        return undefined;
      }),
    } as unknown as ConfigService<Env, true>;

    const redis = {
      incr: incrMock,
      expire: expireMock,
    } as unknown as RedisClient;

    service = new AiService(config, redis);
    (service as unknown as { client: { send: typeof sendMock } }).client = {
      send: sendMock,
    };
  });

  it('returns null when all input fields are empty', async () => {
    const result = await service.translate({ name: '   ', description: null });
    expect(result).toBeNull();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('translates from a known sourceLang and tags AI translations', async () => {
    sendMock.mockResolvedValue({
      output: {
        message: {
          content: [
            {
              toolUse: {
                input: {
                  vi: { name: 'Cà phê trứng' },
                  zh: { name: '鸡蛋咖啡' },
                  ja: { name: 'エッグコーヒー' },
                },
              },
            },
          ],
        },
      },
    });

    const result = await service.translate(
      { name: 'Egg coffee', description: '' },
      { sourceLang: 'en', subject: 'travel dish' },
    );

    expect(result).toEqual({
      sourceLang: 'en',
      translations: {
        en: {
          fields: { name: 'Egg coffee' },
          isAiTranslated: false,
          translatedFrom: null,
        },
        vi: {
          fields: { name: 'Cà phê trứng' },
          isAiTranslated: true,
          translatedFrom: 'en',
        },
        zh: {
          fields: { name: '鸡蛋咖啡' },
          isAiTranslated: true,
          translatedFrom: 'en',
        },
        ja: {
          fields: { name: 'エッグコーヒー' },
          isAiTranslated: true,
          translatedFrom: 'en',
        },
      },
    });
  });

  it('detects sourceLang when omitted and preserves original source fields', async () => {
    sendMock.mockResolvedValue({
      output: {
        message: {
          content: [
            {
              toolUse: {
                input: {
                  sourceLang: 'vi',
                  translations: {
                    en: { name: 'Beef pho' },
                    vi: { name: 'Phở bò (AI)' },
                    zh: { name: '牛肉河粉' },
                    ja: { name: '牛肉フォー' },
                  },
                },
              },
            },
          ],
        },
      },
    });

    const result = await service.translate({ name: 'Phở bò' });

    expect(result).toEqual({
      sourceLang: 'vi',
      translations: {
        vi: {
          fields: { name: 'Phở bò' },
          isAiTranslated: false,
          translatedFrom: null,
        },
        en: {
          fields: { name: 'Beef pho' },
          isAiTranslated: true,
          translatedFrom: 'vi',
        },
        zh: {
          fields: { name: '牛肉河粉' },
          isAiTranslated: true,
          translatedFrom: 'vi',
        },
        ja: {
          fields: { name: '牛肉フォー' },
          isAiTranslated: true,
          translatedFrom: 'vi',
        },
      },
    });
  });

  it('drops translations whose script does not match the target locale', async () => {
    sendMock.mockResolvedValue({
      output: {
        message: {
          content: [
            {
              toolUse: {
                input: {
                  vi: { name: 'Phở bò' },
                  zh: { name: 'Beef Pho' },
                  ja: { name: '牛肉フォー' },
                },
              },
            },
          ],
        },
      },
    });

    const result = await service.translate(
      { name: 'Beef pho' },
      { sourceLang: 'en' },
    );

    expect(result?.translations.zh).toBeUndefined();
    expect(result?.translations.vi?.isAiTranslated).toBe(true);
    expect(result?.translations.ja?.isAiTranslated).toBe(true);
  });

  it('uses fallback model when primary RPM limit is exceeded', async () => {
    incrMock.mockResolvedValue(3);
    sendMock.mockResolvedValue({
      output: {
        message: {
          content: [{ toolUse: { input: { ok: true } } }],
        },
      },
    });

    const result = await service.generateJson<{ ok: boolean }>(
      'test',
      'hello',
      { type: 'object', properties: { ok: { type: 'boolean' } } },
    );

    expect(result).toEqual({ ok: true });
    expect(sendMock).toHaveBeenCalledTimes(1);
    const command = sendMock.mock.calls[0][0];
    expect(command.input.modelId).toBe('global.amazon.nova-2-lite-v1:0');
  });
});
