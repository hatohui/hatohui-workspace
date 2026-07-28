import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

export interface SendTemplateEmailParams {
  to: { email: string; name?: string }[];
  templateId: number;
  params?: Record<string, unknown>;
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

  async sendTemplateEmail({
    to,
    templateId,
    params,
  }: SendTemplateEmailParams): Promise<boolean> {
    try {
      await this.client.transactionalEmails.sendTransacEmail({
        to,
        templateId,
        params,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email (templateId=${templateId})`,
        error instanceof Error ? error.stack : error,
      );
      return false;
    }
  }
}

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
