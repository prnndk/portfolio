import { FadeIn } from '@/components/aceternity/text-reveal';
import { Pagination } from '@/components/pagination';
import { PageHeader } from '@/components/portfolio/page-header';
import { ProjectTile } from '@/components/portfolio/project-tile';
import { ScrollToTop } from '@/components/portfolio/scroll-to-top';
import { Seo } from '@/components/seo';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import GuestLayout from '@/layouts/guest-layout';
import { type PaginatedData, type Project } from '@/types';
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
            <ScrollToTop />

            <div className="mx-auto w-full max-w-6xl px-4 py-28 sm:px-6 md:py-36">
                <PageHeader title="All Projects" description="A showcase of my work, side projects, and open source contributions." />

                {projects.data.length > 0 ? (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.data.map((project, index) => (
                                <FadeIn key={project.id} delay={index * 0.08}>
                                    <ProjectTile project={project} index={index} />
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
