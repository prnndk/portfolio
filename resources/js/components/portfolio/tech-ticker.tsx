'use client';

import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import { type TechStack as TechStackType } from '@/types';

interface TechTickerProps {
    items: TechStackType[];
    speed?: number;
}

export function TechTicker({ items, speed = 30 }: TechTickerProps) {
    // Duplicate items for seamless loop
    const duplicatedItems = [...items, ...items];

    return (
        <div className="relative overflow-hidden py-6">
            <motion.div
                className="flex gap-6"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                    duration: items.length * (60 / speed),
                    ease: 'linear',
                    repeat: Infinity,
                }}
            >
                {duplicatedItems.map((item, index) => (
                    <TechCard key={`${item.id}-${index}`} tech={item} />
                ))}
            </motion.div>
        </div>
    );
}

interface TechCardProps {
    tech: TechStackType;
}

function TechCard({ tech }: TechCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-colors hover:border-primary/50"
            style={{
                backgroundColor: tech.color ? `${tech.color}10` : undefined,
            }}
        >
            {/* Icon */}
            <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                    backgroundColor: tech.color ? `${tech.color}20` : 'hsl(var(--muted))',
                }}
            >
                {tech.icon ? (
                    <img
                        src={`/storage/${tech.icon}`}
                        alt={tech.name}
                        className="h-6 w-6 object-contain"
                    />
                ) : tech.icon_url ? (
                    <img
                        src={tech.icon_url}
                        alt={tech.name}
                        className="h-6 w-6 object-contain"
                    />
                ) : (
                    <Cpu
                        className="h-5 w-5"
                        style={{ color: tech.color || 'currentColor' }}
                    />
                )}
            </div>

            {/* Text */}
            <div>
                <p className="font-medium whitespace-nowrap">{tech.name}</p>
                {tech.proficiency && (
                    <p
                        className="text-xs"
                        style={{ color: tech.color || 'hsl(var(--muted-foreground))' }}
                    >
                        {tech.proficiency}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// Grouped display for when you want to show by category
interface TechStackGridProps {
    items: TechStackType[];
    groupByCategory?: boolean;
}

export function TechStackGrid({ items, groupByCategory = true }: TechStackGridProps) {
    if (!groupByCategory) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {items.map((tech) => (
                    <TechCard key={tech.id} tech={tech} />
                ))}
            </div>
        );
    }

    const categories = [...new Set(items.map((t) => t.category).filter(Boolean))];
    const uncategorized = items.filter((t) => !t.category);

    return (
        <div className="space-y-8">
            {categories.map((category) => (
                <div key={category}>
                    <h3 className="mb-4 font-heading text-xl font-semibold">{category}</h3>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {items
                            .filter((t) => t.category === category)
                            .map((tech) => (
                                <TechCard key={tech.id} tech={tech} />
                            ))}
                    </div>
                </div>
            ))}
            {uncategorized.length > 0 && (
                <div>
                    <h3 className="mb-4 font-heading text-xl font-semibold">Other</h3>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {uncategorized.map((tech) => (
                            <TechCard key={tech.id} tech={tech} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
