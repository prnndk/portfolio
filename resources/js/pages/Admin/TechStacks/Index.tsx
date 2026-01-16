import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem, type TechStack } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Cpu, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tech Stacks', href: '/admin/tech-stacks' },
];

interface Props {
    techStacks: TechStack[];
}

export default function TechStacksIndex({ techStacks }: Props) {
    const [deleting, setDeleting] = useState<number | null>(null);
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this tech stack?')) {
            setDeleting(id);
            destroy(`/admin/tech-stacks/${id}`, {
                onFinish: () => setDeleting(null),
            });
        }
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tech Stacks" />
            <div className="p-4 md:p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Tech Stacks</h1>
                        <p className="text-muted-foreground">
                            Manage technologies displayed on your portfolio
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/tech-stacks/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Tech
                        </Link>
                    </Button>
                </div>

                {techStacks.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Cpu className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No tech stacks yet</h3>
                            <p className="text-muted-foreground">
                                Add your first technology to showcase your skills.
                            </p>
                            <Button asChild className="mt-4">
                                <Link href="/admin/tech-stacks/create">Add Tech Stack</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {techStacks.map((tech) => (
                            <Card key={tech.id} className="relative overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                backgroundColor: tech.color
                                                    ? `${tech.color}20`
                                                    : 'hsl(var(--muted))',
                                            }}
                                        >
                                            {tech.icon ? (
                                                <img
                                                    src={`/storage/${tech.icon}`}
                                                    alt={tech.name}
                                                    className="h-8 w-8 object-contain"
                                                />
                                            ) : tech.icon_url ? (
                                                <img
                                                    src={tech.icon_url}
                                                    alt={tech.name}
                                                    className="h-8 w-8 object-contain"
                                                />
                                            ) : (
                                                <Cpu
                                                    className="h-6 w-6"
                                                    style={{ color: tech.color || 'currentColor' }}
                                                />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{tech.name}</h3>
                                            {tech.category && (
                                                <Badge variant="secondary" className="text-xs mt-1">
                                                    {tech.category}
                                                </Badge>
                                            )}
                                            {tech.proficiency && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {tech.proficiency}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {!tech.is_active && (
                                        <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                                            Inactive
                                        </Badge>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" asChild className="flex-1">
                                            <Link href={`/admin/tech-stacks/${tech.id}/edit`}>
                                                <Edit className="mr-1 h-3 w-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(tech.id)}
                                            disabled={deleting === tech.id}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
