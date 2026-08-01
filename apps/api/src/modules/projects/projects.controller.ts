import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { OptionalAuthGuard } from '@/modules/auth/optional-auth.guard';
import { OptionalCurrentUser } from '@/modules/auth/optional-current-user.decorator';
import type { User } from '@prisma/client';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  ProjectDto,
  UpdateProjectDto,
  UpdateProjectVisibilityDto,
} from './dto/project.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'projects',
    summary: 'List projects (hidden ones only visible to admins)',
  })
  @ApiOkResponse({ type: ProjectDto, isArray: true })
  list(@OptionalCurrentUser() viewer: User | null): Promise<ProjectDto[]> {
    return this.projectsService.list(viewer);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'project', summary: 'Get a project by id' })
  @ApiOkResponse({ type: ProjectDto })
  findOne(
    @Param('id') id: string,
    @OptionalCurrentUser() viewer: User | null,
  ): Promise<ProjectDto> {
    return this.projectsService.findOne(id, viewer);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'createProject', summary: 'Create a project' })
  @ApiOkResponse({ type: ProjectDto })
  create(@Body() dto: CreateProjectDto): Promise<ProjectDto> {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'updateProject', summary: 'Update a project' })
  @ApiOkResponse({ type: ProjectDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectsService.update(id, dto);
  }

  @Patch(':id/visibility')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateProjectVisibility',
    summary: 'Show or hide a project from the public gallery',
  })
  @ApiOkResponse({ type: ProjectDto })
  updateVisibility(
    @Param('id') id: string,
    @Body() dto: UpdateProjectVisibilityDto,
  ): Promise<ProjectDto> {
    return this.projectsService.updateVisibility(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteProject', summary: 'Delete a project' })
  remove(@Param('id') id: string): Promise<void> {
    return this.projectsService.remove(id);
  }
}
