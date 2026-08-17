import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ProjectsController } from '@/modules/projects/projects.controller';
import { ProjectsService } from '@/modules/projects/services/projects.service';

@Module({
  imports: [AuthModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
