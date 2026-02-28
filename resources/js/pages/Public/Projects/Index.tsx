import { ProjectCard } from '@/components/aceternity/card-hover';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { Pagination } from '@/components/pagination';
import { PageHeader } from '@/components/portfolio/page-header';
import { Seo } from '@/components/seo';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import GuestLayout from '@/layouts/guest-layout';
import { getProjectImage } from '@/lib/project-utils';
import { type PaginatedData, type Project } from '@/types';
import { Link } from '@inertiajs/react';
import { FolderOpen } from 'lucide-react';

interface Props {
    projects: PaginatedData<Project>;
}

export default function ProjectsIndex({ projects }: Props) {
    return (
        <GuestLayout>
            <Seo
                title="Projects | Arya Gading Prinandika"
                description="A showcase of my work, side projects, and open source contributions."
                url="/projects"
            />

            <div className="container mx-auto px-4 py-24">
                <PageHeader title="All Projects" description="A showcase of my work, side projects, and open source contributions." />

                {projects.data.length > 0 ? (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.data.map((project, index) => (
                                <FadeIn key={project.id} delay={index * 0.1}>
                                    <Link href={`/projects/${project.slug}`}>
                                        <ProjectCard
                                            title={project.title}
                                            description={project.description}
                                            image={getProjectImage(project)}
                                            tags={project.tech_tags || []}
                                        />
                                    </Link>
                                </FadeIn>
                            ))}
                        </div>

                        <Pagination paginator={projects} />
                    </>
                ) : (
                    <FadeIn delay={0.2}>
                        <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FolderOpen className="h-6 w-6" />
                                    </EmptyMedia>
                                    <EmptyTitle>No projects yet</EmptyTitle>
                                    <EmptyDescription>Projects will be showcased here once they are added.</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    </FadeIn>
                )}
            </div>
        </GuestLayout>
    );
}
