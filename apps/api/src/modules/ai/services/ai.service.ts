import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ContentBlock,
  type ToolInputSchema,
} from '@aws-sdk/client-bedrock-runtime';
import { RedisClient } from '@/infra/redis';
import type { Env } from '@/config/env';
import {
  AI_CONNECT_TIMEOUT_MS,
  AI_DEFAULT_FALLBACK_MODEL_ID,
  AI_DEFAULT_MODEL_ID,
  AI_DEFAULT_PRIMARY_RPM,
  AI_DEFAULT_REGION,
  AI_LOCALE_NAMES,
  AI_MAX_ATTEMPTS,
  AI_REQUEST_TIMEOUT_MS,
  AI_RPM_KEY_PREFIX,
  AI_RPM_KEY_TTL_SECONDS,
  AI_SUPPORTED_LOCALES,
  AI_TOOL_NAME,
  AI_TRANSLATE_CALL,
  AI_TRANSLATE_SYSTEM_INSTRUCTION,
  type AiLocale,
} from '@/modules/ai/ai.constants';
import { isTextInLocaleScript } from '@/modules/ai/utils/locale-script';

export type AiJsonSchema = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  properties?: Record<string, AiJsonSchema>;
  items?: AiJsonSchema;
  required?: string[];
  enum?: readonly string[];
};

export interface AiCallOptions {
  timeoutMs: number;
  maxTokens: number;
  temperature: number;
  model?: string;
  fallbackModel?: string;
}

export type TranslateFields = Record<string, string | null | undefined>;

export interface TranslateOptions {
  sourceLang?: AiLocale;
  targetLocales?: readonly AiLocale[];
  subject?: string;
  context?: string;
  call?: Partial<AiCallOptions>;
}

export interface TranslatedEntry<T extends Record<string, string>> {
  fields: Partial<T>;
  isAiTranslated: boolean;
  translatedFrom: AiLocale | null;
}

export interface TranslateResult<T extends Record<string, string>> {
  sourceLang: AiLocale;
  translations: Partial<Record<AiLocale, TranslatedEntry<T>>>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly primaryModel: string;
  private readonly fallbackModel: string;
  private readonly primaryRpm: number;
  private readonly region: string;
  private client: BedrockRuntimeClient | null = null;

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly redis: RedisClient,
  ) {
    this.primaryModel =
      this.config.get('BEDROCK_MODEL_ID', { infer: true }) ||
      AI_DEFAULT_MODEL_ID;
    this.fallbackModel =
      this.config.get('AI_FALLBACK_MODEL_ID', { infer: true }) ||
      AI_DEFAULT_FALLBACK_MODEL_ID;
    this.primaryRpm =
      this.config.get('AI_PRIMARY_RPM', { infer: true }) ??
      AI_DEFAULT_PRIMARY_RPM;
    this.region =
      this.config.get('BEDROCK_REGION', { infer: true }) ||
      this.config.get('AWS_REGION', { infer: true }) ||
      AI_DEFAULT_REGION;
  }

  async translate<T extends TranslateFields>(
    fields: T,
    options: TranslateOptions = {},
  ): Promise<TranslateResult<{ [K in keyof T]: string }> | null> {
    type CleanFields = { [K in keyof T]: string };
    const cleanFields = extractNonEmptyFields(fields) as Partial<CleanFields>;
    const fieldKeys = Object.keys(cleanFields) as (keyof CleanFields &
      string)[];
    if (fieldKeys.length === 0) return null;

    const targetLocales = options.targetLocales ?? AI_SUPPORTED_LOCALES;
    const subject = options.subject ?? 'content';
    const fieldSchema = buildFieldSchema(fieldKeys);
    const call: AiCallOptions = { ...AI_TRANSLATE_CALL, ...options.call };

    if (options.sourceLang) {
      return this.translateFromKnownSource<CleanFields>(
        cleanFields,
        fieldKeys,
        fieldSchema,
        options.sourceLang,
        targetLocales,
        subject,
        options.context,
        call,
      );
    }

    return this.translateWithDetectedSource<CleanFields>(
      cleanFields,
      fieldKeys,
      fieldSchema,
      targetLocales,
      subject,
      options.context,
      call,
    );
  }

  async generateJson<T>(
    subject: string,
    contents: string | ContentBlock[],
    schema: AiJsonSchema,
    systemInstruction = AI_TRANSLATE_SYSTEM_INSTRUCTION,
    call: AiCallOptions = AI_TRANSLATE_CALL,
  ): Promise<T | null> {
    const models = [
      ...new Set([
        call.model ?? this.primaryModel,
        call.fallbackModel ?? this.fallbackModel,
      ]),
    ].filter((m): m is string => Boolean(m));

    for (const [index, model] of models.entries()) {
      const hasNext = index < models.length - 1;
      if (
        model === this.primaryModel &&
        hasNext &&
        (await this.isOverPrimaryLimit())
      ) {
        this.logger.warn(
          `${this.primaryModel} is over ${this.primaryRpm}/min, skipping to fallback`,
        );
        continue;
      }
      const result = await this.converse<T>(
        model,
        subject,
        contents,
        schema,
        systemInstruction,
        call,
      );
      if (result) return result;
    }

    return null;
  }

  private async translateFromKnownSource<T extends Record<string, string>>(
    cleanFields: Partial<T>,
    fieldKeys: (keyof T & string)[],
    fieldSchema: Record<string, AiJsonSchema>,
    sourceLang: AiLocale,
    targetLocales: readonly AiLocale[],
    subject: string,
    context: string | undefined,
    call: AiCallOptions,
  ): Promise<TranslateResult<T> | null> {
    const translations: Partial<Record<AiLocale, TranslatedEntry<T>>> = {
      [sourceLang]: {
        fields: cleanFields,
        isAiTranslated: false,
        translatedFrom: null,
      },
    };

    const targets = targetLocales.filter((locale) => locale !== sourceLang);
    if (targets.length === 0) {
      return { sourceLang, translations };
    }

    const promptLines = [
      `Translate this ${subject} from '${sourceLang}' into: ${targets.join(', ')}.`,
      ...(context ? [`Context: ${context}`] : []),
      JSON.stringify(cleanFields),
    ];

    const generated = await this.generateJson<
      Record<string, Partial<Record<string, string>>>
    >(
      subject,
      promptLines.join('\n\n'),
      perLocaleSchema(targets, fieldSchema),
      AI_TRANSLATE_SYSTEM_INSTRUCTION,
      call,
    );
    if (!generated) return null;

    this.collectValidatedTranslations(
      translations,
      generated,
      targets,
      fieldKeys,
      sourceLang,
    );

    return { sourceLang, translations };
  }

  private async translateWithDetectedSource<T extends Record<string, string>>(
    cleanFields: Partial<T>,
    fieldKeys: (keyof T & string)[],
    fieldSchema: Record<string, AiJsonSchema>,
    targetLocales: readonly AiLocale[],
    subject: string,
    context: string | undefined,
    call: AiCallOptions,
  ): Promise<TranslateResult<T> | null> {
    const schema: AiJsonSchema = {
      type: 'object',
      properties: {
        sourceLang: {
          type: 'string',
          description: `The detected source locale of the input from: ${AI_SUPPORTED_LOCALES.join(', ')}.`,
          enum: AI_SUPPORTED_LOCALES,
        },
        translations: perLocaleSchema(targetLocales, fieldSchema),
      },
      required: ['sourceLang', 'translations'],
    };

    const promptLines = [
      `Detect the source language of this ${subject} (one of: ${AI_SUPPORTED_LOCALES.join(', ')}) and translate it into: ${targetLocales.join(', ')}.`,
      ...(context ? [`Context: ${context}`] : []),
      JSON.stringify(cleanFields),
    ];

    const generated = await this.generateJson<{
      sourceLang?: string;
      translations?: Record<string, Partial<Record<string, string>>>;
    }>(
      subject,
      promptLines.join('\n\n'),
      schema,
      AI_TRANSLATE_SYSTEM_INSTRUCTION,
      call,
    );
    if (!generated?.sourceLang || !generated.translations) return null;

    if (!isAiLocale(generated.sourceLang)) {
      this.logger.warn(
        `AI returned unsupported sourceLang: ${generated.sourceLang}`,
      );
      return null;
    }

    const sourceLang = generated.sourceLang;
    const translations: Partial<Record<AiLocale, TranslatedEntry<T>>> = {
      [sourceLang]: {
        fields: cleanFields,
        isAiTranslated: false,
        translatedFrom: null,
      },
    };

    const targets = targetLocales.filter((locale) => locale !== sourceLang);
    this.collectValidatedTranslations(
      translations,
      generated.translations,
      targets,
      fieldKeys,
      sourceLang,
    );

    return { sourceLang, translations };
  }

  private collectValidatedTranslations<T extends Record<string, string>>(
    translations: Partial<Record<AiLocale, TranslatedEntry<T>>>,
    generated: Record<string, Partial<Record<string, string>>>,
    targets: readonly AiLocale[],
    fieldKeys: (keyof T & string)[],
    sourceLang: AiLocale,
  ): void {
    for (const locale of targets) {
      const candidate = generated[locale];
      if (!candidate) continue;

      const validated: Partial<T> = {};
      for (const key of fieldKeys) {
        const value = candidate[key]?.trim();
        if (!value) continue;
        if (!isTextInLocaleScript(value, locale)) {
          this.logger.warn(
            `Dropped ${locale}.${key} because script did not match locale`,
          );
          continue;
        }
        validated[key] = value as T[typeof key];
      }

      if (Object.keys(validated).length > 0) {
        translations[locale] = {
          fields: validated,
          isAiTranslated: true,
          translatedFrom: sourceLang,
        };
      }
    }
  }

  private async isOverPrimaryLimit(): Promise<boolean> {
    try {
      const minute = Math.floor(Date.now() / 60_000);
      const key = `${AI_RPM_KEY_PREFIX}:${this.primaryModel}:${minute}`;
      const used = await this.redis.incr(key);
      if (used === 1) {
        await this.redis.expire(key, AI_RPM_KEY_TTL_SECONDS);
      }
      return used > this.primaryRpm;
    } catch (err) {
      this.logger.warn(`Failed to check AI RPM limit: ${err}`);
      return false;
    }
  }

  private getClient(): BedrockRuntimeClient {
    this.client ??= new BedrockRuntimeClient({
      region: this.region,
      maxAttempts: AI_MAX_ATTEMPTS,
      requestHandler: {
        connectionTimeout: AI_CONNECT_TIMEOUT_MS,
        requestTimeout: AI_REQUEST_TIMEOUT_MS,
      },
    });
    return this.client;
  }

  private async converse<T>(
    model: string,
    subject: string,
    contents: string | ContentBlock[],
    schema: AiJsonSchema,
    systemInstruction: string,
    call: AiCallOptions,
  ): Promise<T | null> {
    try {
      const response = await this.getClient().send(
        new ConverseCommand({
          modelId: model,
          system: [{ text: systemInstruction }],
          messages: [
            {
              role: 'user',
              content:
                typeof contents === 'string' ? [{ text: contents }] : contents,
            },
          ],
          inferenceConfig: {
            temperature: call.temperature,
            maxTokens: call.maxTokens,
          },
          toolConfig: {
            tools: [
              {
                toolSpec: {
                  name: AI_TOOL_NAME,
                  description: `Return the ${subject}`,
                  inputSchema: { json: schema } as unknown as ToolInputSchema,
                },
              },
            ],
            toolChoice: { tool: { name: AI_TOOL_NAME } },
          },
        }),
        { abortSignal: AbortSignal.timeout(call.timeoutMs) },
      );

      const toolUse = response.output?.message?.content?.find(
        (block) => block.toolUse,
      )?.toolUse;
      return (toolUse?.input as T | undefined) ?? null;
    } catch (err) {
      this.logger.error(`${model} failed to generate ${subject}: ${err}`);
      return null;
    }
  }
}

function isAiLocale(value: string): value is AiLocale {
  return (AI_SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function extractNonEmptyFields(
  fields: TranslateFields,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const trimmed = value?.trim();
    if (trimmed) result[key] = trimmed;
  }
  return result;
}

function buildFieldSchema(fieldKeys: string[]): Record<string, AiJsonSchema> {
  return Object.fromEntries(
    fieldKeys.map((key) => [
      key,
      {
        type: 'string',
        description: `Translated ${key}`,
      } satisfies AiJsonSchema,
    ]),
  );
}

function perLocaleSchema(
  locales: readonly AiLocale[],
  localeFields: Record<string, AiJsonSchema>,
): AiJsonSchema {
  return {
    type: 'object',
    properties: Object.fromEntries(
      locales.map((locale) => [
        locale,
        {
          type: 'object',
          description: `Content in ${AI_LOCALE_NAMES[locale]}`,
          properties: localeFields,
          required: Object.keys(localeFields),
        } satisfies AiJsonSchema,
      ]),
    ),
    required: [...locales],
  };
}
