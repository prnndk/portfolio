'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { X, Star, ExternalLink, Film, Music, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExpandableCardItem {
    id: number;
    title: string;
    description: string;
    image: string | null;
    type: 'movie' | 'music' | 'book';
    creator: string | null;
    year: string | null;
    genre: string | null;
    content: string | null;
    external_url: string | null;
    rating: number | null;
}

interface ExpandableCardProps {
    items: ExpandableCardItem[];
    className?: string;
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

const TypeLabel = ({ type }: { type: 'movie' | 'music' | 'book' }) => {
    const labels = {
        movie: 'Director',
        music: 'Artist',
        book: 'Author',
    };
    return labels[type];
};

const RatingStars = ({ rating }: { rating: number | null }) => {
    if (!rating) return null;
    const stars = Math.round(rating / 2); // Convert 1-10 to 1-5 stars
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        'h-4 w-4',
                        i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                    )}
                />
            ))}
            <span className="ml-1 text-sm text-muted-foreground">{rating}/10</span>
        </div>
    );
};

export function ExpandableCard({ items, className }: ExpandableCardProps) {
    const [active, setActive] = useState<ExpandableCardItem | null>(null);
    const id = useId();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setActive(null);
            }
        }

        if (active) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    return (
        <>
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {active && (
                    <div className="fixed inset-0 z-50 grid place-items-center p-4">
                        <motion.button
                            key={`button-${active.id}-${id}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md lg:hidden"
                            onClick={() => setActive(null)}
                        >
                            <X className="h-5 w-5 text-white" />
                        </motion.button>
                        <motion.div
                            layoutId={`card-${active.id}-${id}`}
                            ref={ref}
                            className="flex h-full max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl md:h-fit"
                        >
                            {/* Image */}
                            <motion.div layoutId={`image-${active.id}-${id}`} className="relative">
                                {active.image ? (
                                    <img
                                        src={`/storage/${active.image}`}
                                        alt={active.title}
                                        className="h-64 w-full object-cover sm:h-80"
                                    />
                                ) : (
                                    <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 sm:h-80">
                                        <TypeIcon type={active.type} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                            </motion.div>

                            {/* Content */}
                            <div className="flex flex-1 flex-col overflow-y-auto p-6">
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div>
                                        <motion.span
                                            layoutId={`type-${active.id}-${id}`}
                                            className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                        >
                                            <TypeIcon type={active.type} />
                                            {active.type.charAt(0).toUpperCase() + active.type.slice(1)}
                                        </motion.span>
                                        <motion.h3
                                            layoutId={`title-${active.id}-${id}`}
                                            className="font-heading text-2xl font-bold text-foreground"
                                        >
                                            {active.title}
                                        </motion.h3>
                                        {active.creator && (
                                            <motion.p
                                                layoutId={`creator-${active.id}-${id}`}
                                                className="mt-1 text-sm text-muted-foreground"
                                            >
                                                {TypeLabel({ type: active.type })}: {active.creator}
                                            </motion.p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setActive(null)}
                                        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted-foreground/20 lg:flex"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Meta info */}
                                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    {active.year && (
                                        <span className="rounded-md bg-muted px-2 py-1">{active.year}</span>
                                    )}
                                    {active.genre && (
                                        <span className="rounded-md bg-muted px-2 py-1">{active.genre}</span>
                                    )}
                                    <RatingStars rating={active.rating} />
                                </div>

                                {/* Description */}
                                <motion.div
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 space-y-4 text-muted-foreground"
                                >
                                    {active.description && <p>{active.description}</p>}
                                    {active.content && (
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            {active.content}
                                        </div>
                                    )}
                                </motion.div>

                                {/* External link */}
                                {active.external_url && (
                                    <motion.a
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        href={active.external_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Learn More
                                    </motion.a>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Card Grid */}
            <ul className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
                {items.map((item) => (
                    <motion.li
                        layoutId={`card-${item.id}-${id}`}
                        key={item.id}
                        onClick={() => setActive(item)}
                        className="group cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/50 hover:shadow-lg"
                    >
                        <motion.div layoutId={`image-${item.id}-${id}`} className="relative overflow-hidden">
                            {item.image ? (
                                <img
                                    src={`/storage/${item.image}`}
                                    alt={item.title}
                                    className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 transition-all duration-300 group-hover:from-primary/20 group-hover:to-accent/20">
                                    <div className="rounded-full bg-muted p-4">
                                        <TypeIcon type={item.type} />
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        </motion.div>

                        <div className="p-4">
                            <motion.span
                                layoutId={`type-${item.id}-${id}`}
                                className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            >
                                <TypeIcon type={item.type} />
                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </motion.span>
                            <motion.h3
                                layoutId={`title-${item.id}-${id}`}
                                className="font-heading text-lg font-bold text-foreground transition-colors group-hover:text-primary"
                            >
                                {item.title}
                            </motion.h3>
                            {item.creator && (
                                <motion.p
                                    layoutId={`creator-${item.id}-${id}`}
                                    className="mt-1 text-sm text-muted-foreground"
                                >
                                    {item.creator}
                                </motion.p>
                            )}
                            {item.description && (
                                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            )}
                            <div className="mt-3 flex items-center justify-between">
                                {item.rating && <RatingStars rating={item.rating} />}
                                {item.year && (
                                    <span className="text-xs text-muted-foreground">{item.year}</span>
                                )}
                            </div>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </>
    );
}

export default ExpandableCard;
