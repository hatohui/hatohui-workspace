import { ProjectsAdminList } from '@/components/projects/ProjectsAdminList';
import { ProjectCreateForm } from '@/components/projects/ProjectCreateForm';

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <ProjectCreateForm />
      <ProjectsAdminList />
    </div>
  );
}
