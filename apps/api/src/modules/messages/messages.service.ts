import { Injectable } from '@nestjs/common';
import { Database } from '@/libs/db';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<MessageDto[]> {
    const messages = await this.db.message.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return messages.map((message) => ({
      id: message.id,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
    }));
  }
}
