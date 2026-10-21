import { getProjectImage } from '@/lib/project-utils';
import { cn } from '@/lib/utils';
import { type Project } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { TiltCard } from './signal';

/** Project card shared by the homepage bento and the /projects grid. */
export function ProjectTile({ project, index, wide }: { project: Project; index: number; wide?: boolean }) {
    const image = getProjectImage(project);

    return (
        <TiltCard max={5} className="h-full">
            <Link
                href={`/projects/${project.slug}`}
                className={cn(
                    'group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-primary',
                    wide && 'lg:flex-row',
                )}
            >
                <div className={cn('aspect-[16/10] overflow-hidden bg-muted', wide && 'lg:aspect-auto lg:min-h-80 lg:w-1/2')}>
                    {image && (
                        <img
                            src={image}
                            alt={project.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <ArrowUpRight className="h-5 w-5 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold tracking-[-0.03em]">{project.title}</h3>
                    <p className="line-clamp-2 text-muted-foreground">{project.description}</p>
                    {project.tech_tags && project.tech_tags.length > 0 && (
                        <div className="mt-auto flex flex-wrap gap-2 pt-2">
                            {project.tech_tags.slice(0, 4).map((tag) => (
                                <span key={tag} className="rounded-full border border-border px-3 py-1 font-mono text-xs">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
        </TiltCard>
    );
}
