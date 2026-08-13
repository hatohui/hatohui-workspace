import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FriendDto } from '@/modules/friends/dto/friend.dto';
import { AdminGuard, ADMIN_KEY_HEADER } from './admin.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AdminGuard)
@ApiHeader({
  name: ADMIN_KEY_HEADER,
  required: true,
  description: 'Admin API key — required on every route in this controller',
})
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('birthdays')
  @ApiOperation({
    operationId: 'adminBirthdays',
    summary:
      'Every directory entry, ignoring visibility. Admin-only; regular listings stay visibility-filtered.',
  })
  @ApiOkResponse({ type: FriendDto, isArray: true })
  birthdays(): Promise<FriendDto[]> {
    return this.admin.listAllEntries();
  }
}
