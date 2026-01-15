import GuestLayout from '@/layouts/guest-layout';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { Button } from '@/components/ui/button';
import { ExpandableCard } from '@/components/ui/expandable-card';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';
import { type Favorite } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Film, Music, BookOpen, Star, Sparkles } from 'lucide-react';

interface Props {
    favorites: {
        data: Favorite[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        last_page: number;
    };
    currentType: string | null;
}

const TypeIcon = ({ type }: { type: string }) => {
    const icons: Record<string, typeof Film> = {
        movie: Film,
        music: Music,
        book: BookOpen,
    };
    const Icon = icons[type] || Star;
    return <Icon className="h-4 w-4" />;
};

export default function FavoritesIndex({ favorites, currentType }: Props) {
    const filterTypes = [
        { value: null, label: 'All', icon: Sparkles },
        { value: 'movie', label: 'Movies', icon: Film },
        { value: 'music', label: 'Music', icon: Music },
        { value: 'book', label: 'Books', icon: BookOpen },
    ];

    // Transform favorites for expandable card
    const cardItems = favorites.data.map((fav) => ({
        id: fav.id,
        title: fav.title,
        description: fav.description || '',
        image: fav.image,
        type: fav.type,
        creator: fav.creator,
        year: fav.year,
        genre: fav.genre,
        content: fav.content,
        external_url: fav.external_url,
        rating: fav.rating,
    }));

    return (
        <GuestLayout>
            <Head title="Favorites" />

            <div className="container mx-auto px-4 py-24">
                <FadeIn>
                    <div className="mb-12">
                        <Link
                            href="/"
                            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <h1 className="font-heading text-4xl font-bold md:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            My Favorites
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                            A curated collection of movies, music, and books that have inspired and entertained me.
                        </p>
                    </div>
                </FadeIn>

                {/* Type Filter */}
                <FadeIn delay={0.1}>
                    <div className="mb-8 flex flex-wrap items-center gap-3">
                        {filterTypes.map((filter) => {
                            const isActive = currentType === filter.value;
                            return (
                                <Link
                                    key={filter.label}
                                    href={filter.value ? `/favorites?type=${filter.value}` : '/favorites'}
                                    className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                            : 'bg-card border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <filter.icon className={`h-4 w-4 ${isActive ? '' : 'group-hover:text-primary'}`} />
                                    {filter.label}
                                </Link>
                            );
                        })}
                    </div>
                </FadeIn>

                {/* Content */}
                <FadeIn delay={0.2}>
                    {favorites.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 backdrop-blur-sm p-12">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        {currentType ? (
                                            <TypeIcon type={currentType} />
                                        ) : (
                                            <Star className="h-6 w-6" />
                                        )}
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {currentType
                                            ? `No ${currentType}s found`
                                            : 'No favorites yet'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {currentType
                                            ? `There are no ${currentType}s in the favorites collection yet.`
                                            : 'The favorites collection is currently empty.'}
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    ) : (
                        <ExpandableCard items={cardItems} />
                    )}
                </FadeIn>

                {/* Pagination */}
                {favorites.last_page > 1 && (
                    <FadeIn delay={0.3}>
                        <div className="mt-12 flex justify-center gap-2">
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
                                            className="rounded-full"
                                        >
                                            <Link href={link.url}>
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
                                        className="rounded-full"
                                    >
                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                );
                            })}
                        </div>
                    </FadeIn>
                )}
            </div>
        </GuestLayout>
    );
}
