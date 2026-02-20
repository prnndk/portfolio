import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Calendar, Building2, GraduationCap, Award, MoreHorizontal, Image, EyeOff, ArrowUpDown, Map } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from '@/components/ui/empty';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Journeys', href: '/admin/journeys' },
];

interface Journey {
    id: number;
    title: string;
    subtitle: string | null;
    organization: string | null;
    type: 'work' | 'education' | 'achievement' | 'other';
    description: string | null;
    skills: string[] | null;
    logo_display_url: string | null;
    all_gallery_images: { url: string; type: 'uploaded' | 'url'; path: string | null }[];
    start_date: string | null;
    end_date: string | null;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    journeys: Journey[];
}

const typeConfig = {
    work: { label: 'Work', icon: Building2, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    education: { label: 'Education', icon: GraduationCap, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    achievement: { label: 'Achievement', icon: Award, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    other: { label: 'Other', icon: Map, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
};

export default function JourneysIndex({ journeys }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/admin/journeys/${deleteId}`);
            setDeleteId(null);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Journey" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Journey</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your timeline of experiences, education, and achievements
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/journeys/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Journey Item
                        </Link>
                    </Button>
                </div>

                {/* Content */}
                {journeys.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Map className="h-6 w-6" />
                            </EmptyMedia>
                            <EmptyTitle>No journey items yet</EmptyTitle>
                            <EmptyDescription>
                                Start documenting your experiences, education, and achievements.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button asChild>
                                <Link href="/admin/journeys/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Journey
                                </Link>
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <div className="grid gap-4">
                        {journeys.map((journey) => {
                            const config = typeConfig[journey.type];
                            const TypeIcon = config.icon;

                            return (
                                <Card key={journey.id} className={!journey.is_active ? 'opacity-60' : ''}>
                                    <CardContent className="flex items-start gap-4 p-4">
                                        {/* Logo */}
                                        <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-muted overflow-hidden">
                                            {journey.logo_display_url ? (
                                                <img
                                                    src={journey.logo_display_url}
                                                    alt={journey.organization || journey.title}
                                                    className="h-full w-full object-contain p-1"
                                                />
                                            ) : (
                                                <TypeIcon className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h3 className="font-semibold truncate">{journey.title}</h3>
                                                        <Badge variant="secondary" className={`shrink-0 ${config.color}`}>
                                                            {config.label}
                                                        </Badge>
                                                        {!journey.is_active && (
                                                            <Badge variant="outline" className="shrink-0">
                                                                <EyeOff className="h-3 w-3 mr-1" />
                                                                Hidden
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {(journey.subtitle || journey.organization) && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {journey.subtitle}
                                                            {journey.subtitle && journey.organization && ' at '}
                                                            {journey.organization && (
                                                                <span className="font-medium">{journey.organization}</span>
                                                            )}
                                                        </p>
                                                    )}
                                                    {journey.start_date && (
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(journey.start_date)} - {journey.end_date ? formatDate(journey.end_date) : 'Present'}
                                                        </p>
                                                    )}
                                                    {journey.description && (
                                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                            {journey.description}
                                                        </p>
                                                    )}
                                                    {/* Skills */}
                                                    {journey.skills && journey.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {journey.skills.slice(0, 5).map((skill, i) => (
                                                                <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {journey.skills.length > 5 && (
                                                                <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                                                                    +{journey.skills.length - 5}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {/* Gallery indicator */}
                                                    {journey.all_gallery_images.length > 0 && (
                                                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                            <Image className="h-3 w-3" />
                                                            {journey.all_gallery_images.length} photo{journey.all_gallery_images.length > 1 ? 's' : ''}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="shrink-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/journeys/${journey.id}/edit`}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setDeleteId(journey.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Sort Order Info */}
                {journeys.length > 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex items-center gap-3 p-4">
                            <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Sort Order</p>
                                <p className="text-xs text-muted-foreground">
                                    Items are sorted by their sort order first, then by start date (newest first). Edit an item to change its position.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Journey Item</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this journey item? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
