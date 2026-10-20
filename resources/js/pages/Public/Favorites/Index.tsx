import { FadeIn } from '@/components/aceternity/text-reveal';
import { Pagination } from '@/components/pagination';
import { PageHeader } from '@/components/portfolio/page-header';
import { EmptyBlock, FilterChip, PageContainer } from '@/components/portfolio/signal';
import { Seo } from '@/components/seo';
import { ExpandableCard } from '@/components/ui/expandable-card';
import GuestLayout from '@/layouts/guest-layout';
import { type Favorite, type PaginatedData } from '@/types';
import { BookOpen, Film, Music, Sparkles } from 'lucide-react';

interface Props {
    favorites: PaginatedData<Favorite>;
    currentType: string | null;
}

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

            <PageContainer>
                <PageHeader
                    title="My Favorites"
                    description="A curated collection of movies, music, and books that have inspired and entertained me."
                />

                {/* Type Filter */}
                <FadeIn delay={0.1}>
                    <div className="mb-10 flex flex-wrap items-center gap-2" role="navigation" aria-label="Filter by type">
                        {filterTypes.map((filter) => (
                            <FilterChip
                                key={filter.label}
                                href={filter.value ? `/favorites?type=${filter.value}` : '/favorites'}
                                active={currentType === filter.value}
                            >
                                <filter.icon className="h-4 w-4" />
                                {filter.label}
                            </FilterChip>
                        ))}
                    </div>
                </FadeIn>

                {/* Content */}
                <FadeIn delay={0.2}>
                    {favorites.data.length === 0 ? (
                        <EmptyBlock
                            title={currentType ? `No ${currentType}s found` : 'No favorites yet'}
                            text={
                                currentType
                                    ? `There are no ${currentType}s in the favorites collection yet.`
                                    : 'The favorites collection is currently empty.'
                            }
                        />
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
            </PageContainer>
        </GuestLayout>
    );
}
