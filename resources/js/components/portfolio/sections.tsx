'use client';

import { motion } from 'framer-motion';
import { type Activity, type Post, type Project } from '@/types';

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
                        className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-medium"
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
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative pl-8"
        >
            {/* Timeline line */}
            {!isLast && (
                <div className="absolute left-[11px] top-8 h-full w-0.5 bg-border" />
            )}

            {/* Timeline dot */}
            <div className="absolute left-0 top-2 h-6 w-6 rounded-full border-2 border-primary bg-background" />

            <a href={`/activities/${activity.id}`} className="block pb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-heading text-lg font-semibold">{activity.title}</h3>
                        {activity.role && (
                            <p className="text-sm text-primary">{activity.role}</p>
                        )}
                        {activity.organization && (
                            <p className="text-sm text-muted-foreground">{activity.organization}</p>
                        )}
                    </div>
                    {activity.start_date && (
                        <span className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatDate(activity.start_date)}
                            {activity.end_date ? ` - ${formatDate(activity.end_date)}` : ' - Present'}
                        </span>
                    )}
                </div>
                {activity.description && (
                    <p className="mt-2 text-muted-foreground line-clamp-2">{activity.description}</p>
                )}
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
            </a>
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

    return (
        <motion.a
            href={`/blog/${post.slug}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
        >
            {post.featured_image && (
                <div className="aspect-video overflow-hidden">
                    <img
                        src={`/storage/${post.featured_image}`}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                </div>
            )}
            <div className="p-4">
                <p className="text-xs text-muted-foreground">{formatDate(post.published_at)}</p>
                <h3 className="mt-1 font-heading text-lg font-semibold group-hover:text-primary">
                    {post.title}
                </h3>
                {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {post.excerpt}
                    </p>
                )}
            </div>
        </motion.a>
    );
}
