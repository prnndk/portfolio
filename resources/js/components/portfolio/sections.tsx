'use client';

import { type Activity, type Post } from '@/types';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface InfiniteTickerProps {
    items: string[];
    speed?: number;
}

export function TechTicker({ items, speed = 25 }: InfiniteTickerProps) {
    // Duplicate items for seamless loop
    const duplicatedItems = [...items, ...items];

    return (
        <div className="relative overflow-hidden py-4">
            <motion.div
                className="flex gap-8"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                    duration: items.length * (50 / speed),
                    ease: 'linear',
                    repeat: Infinity,
                }}
            >
                {duplicatedItems.map((item, index) => (
                    <div
                        key={`${item}-${index}`}
                        className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium whitespace-nowrap"
                    >
                        {item}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

interface TimelineItemProps {
    activity: Activity;
    isLast?: boolean;
}

export function TimelineItem({ activity, isLast = false }: TimelineItemProps) {
    const formatDate = (date: string | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
        });
    };

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative pl-8">
            {/* Timeline line */}
            {!isLast && <div className="absolute top-8 left-[11px] h-full w-0.5 bg-border" />}

            {/* Timeline dot */}
            <div className="absolute top-2 left-0 h-6 w-6 rounded-full border-2 border-primary bg-background" />

            <Link href={`/activities/${activity.id}`} className="block pb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-heading text-lg font-semibold">{activity.title}</h3>
                        {activity.role && <p className="text-sm text-primary">{activity.role}</p>}
                        {activity.organization && <p className="text-sm text-muted-foreground">{activity.organization}</p>}
                    </div>
                    {activity.start_date && (
                        <span className="text-sm whitespace-nowrap text-muted-foreground">
                            {formatDate(activity.start_date)}
                            {activity.end_date ? ` - ${formatDate(activity.end_date)}` : ' - Present'}
                        </span>
                    )}
                </div>
                {activity.description && <p className="mt-2 line-clamp-2 text-muted-foreground">{activity.description}</p>}
                {activity.gallery && activity.gallery.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto">
                        {activity.gallery.slice(0, 4).map((image, index) => (
                            <img
                                key={index}
                                src={`/storage/${image}`}
                                alt={`${activity.title} gallery ${index + 1}`}
                                className="h-20 w-20 rounded-lg object-cover"
                            />
                        ))}
                    </div>
                )}
            </Link>
        </motion.div>
    );
}

interface BlogCardProps {
    post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
    const formatDate = (date: string | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const image = post.featured_image ? `/storage/${post.featured_image}` : post.featured_image_url;

    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-primary"
        >
            {image && (
                <div className="aspect-video overflow-hidden bg-muted">
                    <img
                        src={image}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>
            )}
            <div className="flex flex-1 flex-col gap-3 p-6">
                <p className="font-mono text-xs text-muted-foreground">{formatDate(post.published_at)}</p>
                <h3 className="font-heading text-2xl font-bold tracking-[-0.03em] transition-colors group-hover:text-primary">{post.title}</h3>
                {post.excerpt && <p className="line-clamp-3 text-muted-foreground">{post.excerpt}</p>}
                {post.tags?.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className="rounded-full border border-border px-3 py-1 font-mono text-xs">
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
