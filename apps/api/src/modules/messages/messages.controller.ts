import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessageDto } from './dto/message.dto';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ operationId: 'messages', summary: 'List all messages' })
  @ApiOkResponse({ type: MessageDto, isArray: true })
  findAll(): Promise<MessageDto[]> {
    return this.messagesService.findAll();
  }
}
