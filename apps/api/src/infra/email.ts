import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

export interface SendTemplateEmailParams {
  to: { email: string; name?: string }[];
  templateId: number;
  params?: Record<string, unknown>;
}

export interface SendHtmlEmailParams {
  to: { email: string; name?: string }[];
  sender: { email: string; name: string };
  subject: string;
  htmlContent: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: BrevoClient;

  constructor() {
    this.client = new BrevoClient({
      apiKey: process.env.EMAIL_API_KEY as string,
    });
  }

  async sendTemplateEmail(params: SendTemplateEmailParams): Promise<boolean> {
    try {
      await this.client.transactionalEmails.sendTransacEmail(params);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email (templateId=${params.templateId})`,
        error instanceof Error ? error.stack : error,
      );
      return false;
    }
  }

  async send(params: SendHtmlEmailParams) {
    await this.client.transactionalEmails.sendTransacEmail(params);
  }
}

export function isRateLimitError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as {
    statusCode?: unknown;
    status?: unknown;
    response?: { status?: unknown; statusCode?: unknown };
  };
  return [
    candidate.statusCode,
    candidate.status,
    candidate.response?.status,
    candidate.response?.statusCode,
  ].includes(RATE_LIMIT_STATUS);
}

const RATE_LIMIT_STATUS = 429;

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
