import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { CommissionAccessService } from '@/modules/commission-access/services/commission-access.service';
import { AccessRateLimitGuard } from '@/modules/commission-access/guards/access-rate-limit.guard';
import {
  CommissionAccessMatchDto,
  CommissionPasscodeDto,
  EmailLookupDto,
  SetArtistPasscodeDto,
  SetClientPasscodeDto,
  UnlockCommissionDto,
  UnlockedCommissionDto,
} from '@/modules/commission-access/dto/commission-access.dto';

@ApiTags('commission-access')
@Controller('commission-access')
export class CommissionAccessController {
  constructor(private readonly access: CommissionAccessService) {}

  @Post('unlock')
  @HttpCode(200)
  @UseGuards(AccessRateLimitGuard)
  @ApiOperation({
    operationId: 'unlockQueuedCommission',
    summary: 'Trade a commission id and its passcode for the order access code',
  })
  @ApiOkResponse({ type: UnlockedCommissionDto })
  unlock(@Body() dto: UnlockCommissionDto): Promise<UnlockedCommissionDto> {
    return this.access.unlock(dto);
  }

  @Post('lookup')
  @HttpCode(200)
  @UseGuards(AccessRateLimitGuard)
  @ApiOperation({
    operationId: 'lookupCommissionsByEmail',
    summary: "Find a client's commissions with an artist by email",
  })
  @ApiOkResponse({ type: CommissionAccessMatchDto, isArray: true })
  lookup(@Body() dto: EmailLookupDto): Promise<CommissionAccessMatchDto[]> {
    return this.access.lookup(dto);
  }

  @Put('code/:code/passcode')
  @UseGuards(AccessRateLimitGuard)
  @ApiOperation({
    operationId: 'setClientCommissionPasscode',
    summary: 'Client chooses the passcode that unlocks their queue item',
  })
  @ApiOkResponse({ type: CommissionPasscodeDto })
  setByClient(
    @Param('code') code: string,
    @Body() dto: SetClientPasscodeDto,
  ): Promise<CommissionPasscodeDto> {
    return this.access.setByClient(code, dto.passcode);
  }

  @Get(':commissionId/passcode')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'commissionPasscode',
    summary: 'Whether a passcode is set on your commission, and by whom',
  })
  @ApiOkResponse({ type: CommissionPasscodeDto })
  get(
    @Param('commissionId') commissionId: string,
    @CurrentUser() user: User,
  ): Promise<CommissionPasscodeDto> {
    return this.access.getForArtist(user.id, commissionId);
  }

  @Put(':commissionId/passcode')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'setCommissionPasscode',
    summary: 'Set a custom passcode, or generate one when none is given',
  })
  @ApiOkResponse({ type: CommissionPasscodeDto })
  setByArtist(
    @Param('commissionId') commissionId: string,
    @Body() dto: SetArtistPasscodeDto,
    @CurrentUser() user: User,
  ): Promise<CommissionPasscodeDto> {
    return this.access.setByArtist(user.id, commissionId, dto.passcode);
  }

  @Delete(':commissionId/passcode')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'clearCommissionPasscode',
    summary: 'Remove the passcode so the queue item can no longer be opened',
  })
  @ApiOkResponse({ type: CommissionPasscodeDto })
  clear(
    @Param('commissionId') commissionId: string,
    @CurrentUser() user: User,
  ): Promise<CommissionPasscodeDto> {
    return this.access.clearByArtist(user.id, commissionId);
  }
}
