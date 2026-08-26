import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OptionalAuthGuard } from '@/modules/auth/guards/optional-auth.guard';
import { OptionalCurrentUser } from '@/modules/auth/decorators/optional-current-user.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/services/auth.service';
import type { User } from '@prisma/client';
import { ProjectsService } from '@/modules/projects/services/projects.service';
import {
  CreateProjectDto,
  ProjectDto,
  UpdateProjectDto,
  UpdateProjectVisibilityDto,
} from '@/modules/projects/dto/project.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'projects',
    summary: 'List projects (hidden ones only visible to admins)',
  })
  @ApiQuery({ name: 'artistId', required: false, type: String })
  @ApiOkResponse({ type: ProjectDto, isArray: true })
  list(
    @OptionalCurrentUser() viewer: User | null,
    @Query('artistId') artistId?: string,
  ): Promise<ProjectDto[]> {
    return this.projectsService.list(viewer, artistId);
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
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: User,
  ): Promise<ProjectDto> {
    await this.assertArtist(user);
    return this.projectsService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'updateProject', summary: 'Update a project' })
  @ApiOkResponse({ type: ProjectDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: User,
  ): Promise<ProjectDto> {
    return this.projectsService.update(user.id, id, dto);
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
    @CurrentUser() user: User,
  ): Promise<ProjectDto> {
    return this.projectsService.updateVisibility(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteProject', summary: 'Delete a project' })
  remove(@Param('id') id: string, @CurrentUser() user: User): Promise<void> {
    return this.projectsService.remove(user.id, id);
  }

  private async assertArtist(user: User): Promise<void> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
  }
}
