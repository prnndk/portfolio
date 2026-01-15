import GuestLayout from '@/layouts/guest-layout';
import { ProjectCard } from '@/components/aceternity/card-hover';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { Button } from '@/components/ui/button';
import { type Project } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, FolderOpen } from 'lucide-react';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';

interface Props {
    projects: {
        data: Project[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
}

export default function ProjectsIndex({ projects }: Props) {
    return (
        <GuestLayout>
            <Head title="Projects" />

            <div className="container mx-auto px-4 py-24">
                <FadeIn>
                    <div className="mb-12">
                        <Link
                            href="/"
                            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <h1 className="font-heading text-4xl font-bold md:text-5xl">
                            All Projects
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                            A showcase of my work, side projects, and open source contributions.
                        </p>
                    </div>
                </FadeIn>

                {projects.data.length > 0 ? (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.data.map((project, index) => (
                                <FadeIn key={project.id} delay={index * 0.1}>
                                    <Link href={`/projects/${project.slug}`}>
                                        <ProjectCard
                                            title={project.title}
                                            description={project.description}
                                            image={project.image ? `/storage/${project.image}` : undefined}
                                            tags={project.tech_tags || []}
                                            url={project.url}
                                            githubUrl={project.github_url}
                                        />
                                    </Link>
                                </FadeIn>
                            ))}
                        </div>

                        {/* Pagination */}
                        {projects.last_page > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                {projects.links.map((link, i) => {
                                    // Simple pagination rendering
                                    if (link.url === null) return null;
                                    const isPrev = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');

                                    if (isPrev || isNext) {
                                        return (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                size="icon"
                                                asChild
                                                disabled={!link.url}
                                            >
                                                <Link href={link.url || '#'}>
                                                    {isPrev ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                                                </Link>
                                            </Button>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            asChild
                                        >
                                            <Link href={link.url}>{link.label}</Link>
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
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
                                    <EmptyDescription>
                                        Projects will be showcased here once they are added.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    </FadeIn>
                )}
            </div>
        </GuestLayout>
    );
}
