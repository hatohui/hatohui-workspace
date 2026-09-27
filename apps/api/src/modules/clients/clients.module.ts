import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ClientsController } from '@/modules/clients/clients.controller';
import { ClientsService } from '@/modules/clients/services/clients.service';
import { ClientIdentityService } from '@/modules/clients/services/client-identity.service';

@Module({
  imports: [AuthModule],
  controllers: [ClientsController],
  providers: [ClientsService, ClientIdentityService],
  exports: [ClientIdentityService],
})
export class ClientsModule {}
