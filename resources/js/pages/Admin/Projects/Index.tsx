import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem, type Project } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, ExternalLink, Github, Star } from 'lucide-react';
import { getProjectImage } from '@/lib/project-utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Projects', href: '/admin/projects' },
];

import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    };
}

export default function ProjectsIndex({ projects }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this project?')) {
            router.delete(`/admin/projects/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <div className="p-4 md:p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Projects</h1>
                        <p className="text-muted-foreground">
                            Manage your portfolio projects
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/projects/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Project
                        </Link>
                    </Button>
                </div>

                {projects.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="mb-4 text-muted-foreground">
                                No projects yet. Create your first one!
                            </p>
                            <Button asChild>
                                <Link href="/admin/projects/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Project
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.data.map((project) => (
                            <Card key={project.id} className="group relative overflow-hidden">
                                {getProjectImage(project) && (
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={getProjectImage(project)}
                                            alt={project.title}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">
                                            {project.title}
                                        </CardTitle>
                                        {project.featured && (
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                                        {project.description}
                                    </p>
                                    {project.tech_tags && project.tech_tags.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-1">
                                            {project.tech_tags.slice(0, 4).map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {project.tech_tags.length > 4 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{project.tech_tags.length - 4}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/projects/${project.id}/edit`}>
                                                <Pencil className="mr-1 h-3 w-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                                            onClick={() => handleDelete(project.id)}
                                        >
                                            <Trash2 className="mr-1 h-3 w-3" />
                                            Delete
                                        </Button>
                                        {project.url && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={project.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </Button>
                                        )}
                                        {project.github_url && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                                    <Github className="h-3 w-3" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {projects.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {projects.links.map((link, i) => {
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
                                        <Link href={link.url}>
                                            {isPrev ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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
                                    <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
