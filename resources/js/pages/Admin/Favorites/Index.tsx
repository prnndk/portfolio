import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from '@/components/ui/empty';
import { type BreadcrumbItem, type Favorite } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Film, Music, BookOpen, Star, ExternalLink, Filter } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Favorites', href: '/admin/favorites' },
];

interface Props {
    favorites: {
        data: Favorite[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
    };
    currentType: string | null;
}

const TypeIcon = ({ type }: { type: 'movie' | 'music' | 'book' }) => {
    const icons = {
        movie: Film,
        music: Music,
        book: BookOpen,
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
};

const TypeBadge = ({ type }: { type: 'movie' | 'music' | 'book' }) => {
    const colors = {
        movie: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        music: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
        book: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return (
        <Badge variant="outline" className={`gap-1 ${colors[type]}`}>
            <TypeIcon type={type} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
    );
};

export default function FavoritesIndex({ favorites, currentType }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this favorite?')) {
            router.delete(`/admin/favorites/${id}`);
        }
    };

    const filterTypes = [
        { value: null, label: 'All' },
        { value: 'movie', label: 'Movies', icon: Film },
        { value: 'music', label: 'Music', icon: Music },
        { value: 'book', label: 'Books', icon: BookOpen },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Favorites" />
            <div className="p-4 md:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Favorites</h1>
                        <p className="text-muted-foreground">
                            Manage your favorite movies, music, and books
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/favorites/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Favorite
                        </Link>
                    </Button>
                </div>

                {/* Type Filter */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    {filterTypes.map((filter) => (
                        <Button
                            key={filter.label}
                            variant={currentType === filter.value ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link href={filter.value ? `/admin/favorites?type=${filter.value}` : '/admin/favorites'}>
                                {filter.icon && <filter.icon className="mr-1 h-3 w-3" />}
                                {filter.label}
                            </Link>
                        </Button>
                    ))}
                </div>

                {favorites.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Star className="h-6 w-6" />
                                    </EmptyMedia>
                                    <EmptyTitle>No favorites yet</EmptyTitle>
                                    <EmptyDescription>
                                        Start adding your favorite movies, music, and books to showcase your tastes.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button asChild>
                                        <Link href="/admin/favorites/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Your First Favorite
                                        </Link>
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {favorites.data.map((favorite) => (
                            <Card key={favorite.id} className="group relative overflow-hidden transition-all hover:shadow-lg">
                                {/* Image */}
                                <div className="aspect-[16/10] overflow-hidden bg-muted">
                                    {favorite.image ? (
                                        <img
                                            src={`/storage/${favorite.image}`}
                                            alt={favorite.title}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                                            <TypeIcon type={favorite.type} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <CardContent className="p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <TypeBadge type={favorite.type} />
                                        {favorite.rating && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                {favorite.rating}/10
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="font-heading text-lg font-bold line-clamp-1">
                                        {favorite.title}
                                    </h3>

                                    {favorite.creator && (
                                        <p className="text-sm text-muted-foreground">
                                            {favorite.creator}
                                        </p>
                                    )}

                                    {favorite.description && (
                                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                            {favorite.description}
                                        </p>
                                    )}

                                    <div className="mt-3 flex flex-wrap items-center gap-1">
                                        {favorite.year && (
                                            <Badge variant="secondary" className="text-xs">
                                                {favorite.year}
                                            </Badge>
                                        )}
                                        {favorite.genre && (
                                            <Badge variant="secondary" className="text-xs">
                                                {favorite.genre}
                                            </Badge>
                                        )}
                                        {!favorite.is_active && (
                                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex items-center gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/favorites/${favorite.id}/edit`}>
                                                <Pencil className="mr-1 h-3 w-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                                            onClick={() => handleDelete(favorite.id)}
                                        >
                                            <Trash2 className="mr-1 h-3 w-3" />
                                            Delete
                                        </Button>
                                        {favorite.external_url && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={favorite.external_url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3" />
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
                {favorites.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {favorites.links.map((link, i) => {
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
