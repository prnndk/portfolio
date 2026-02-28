import { FadeIn } from '@/components/aceternity/text-reveal';
import { Pagination } from '@/components/pagination';
import { Seo } from '@/components/seo';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ExpandableCard } from '@/components/ui/expandable-card';
import GuestLayout from '@/layouts/guest-layout';
import { type Favorite, type PaginatedData } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Film, Music, Sparkles, Star } from 'lucide-react';

interface Props {
    favorites: PaginatedData<Favorite>;
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
            <Seo
                title="Favorites | Arya Gading Prinandika"
                description="A curated collection of movies, music, and books that have inspired and entertained me."
                url="/favorites"
            />

            <div className="container mx-auto px-4 py-24">
                <FadeIn>
                    <div className="mb-12">
                        <Link href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-heading text-4xl font-bold text-transparent md:text-5xl">
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
                                    className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                            : 'border border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground'
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
                        <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12 backdrop-blur-sm">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        {currentType ? <TypeIcon type={currentType} /> : <Star className="h-6 w-6" />}
                                    </EmptyMedia>
                                    <EmptyTitle>{currentType ? `No ${currentType}s found` : 'No favorites yet'}</EmptyTitle>
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
                        <Pagination paginator={favorites} />
                    </FadeIn>
                )}
            </div>
        </GuestLayout>
    );
}
