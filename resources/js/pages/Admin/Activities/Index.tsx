import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem, type Activity } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Calendar, Building2, ImageIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Activities', href: '/admin/activities' },
];

interface Props {
    activities: Activity[];
}

export default function ActivitiesIndex({ activities }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this activity?')) {
            router.delete(`/admin/activities/${id}`);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activities" />
            <div className="p-4 md:p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Activities</h1>
                        <p className="text-muted-foreground">
                            Manage your resume and activities
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/activities/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Activity
                        </Link>
                    </Button>
                </div>

                {activities.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="mb-4 text-muted-foreground">
                                No activities yet. Create your first one!
                            </p>
                            <Button asChild>
                                <Link href="/admin/activities/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Activity
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity) => (
                            <Card key={activity.id}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{activity.title}</h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            {activity.role && (
                                                <span className="flex items-center gap-1">
                                                    {activity.role}
                                                </span>
                                            )}
                                            {activity.organization && (
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {activity.organization}
                                                </span>
                                            )}
                                            {activity.start_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(activity.start_date)}
                                                    {activity.end_date ? ` - ${formatDate(activity.end_date)}` : ' - Present'}
                                                </span>
                                            )}
                                            {activity.gallery && activity.gallery.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <ImageIcon className="h-3 w-3" />
                                                    {activity.gallery.length} photo(s)
                                                </span>
                                            )}
                                        </div>
                                        {activity.description && (
                                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                                {activity.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/activities/${activity.id}/edit`}>
                                                <Pencil className="mr-1 h-3 w-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                                            onClick={() => handleDelete(activity.id)}
                                        >
                                            <Trash2 className="mr-1 h-3 w-3" />
                                            Delete
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
