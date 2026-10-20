'use client';

import { cn } from '@/lib/utils';

interface Stat {
    num: string;
    suffix?: string;
    label: string;
}

interface StatsBarProps {
    stats?: Stat[];
    className?: string;
}

const DEFAULT_STATS: Stat[] = [
    { num: '3', suffix: '+', label: 'Years of Experience' },
    { num: '20', suffix: '+', label: 'Projects Shipped' },
    { num: '10', suffix: '+', label: 'Technologies' },
    { num: '5', suffix: '★', label: 'Client Satisfaction' },
];

export function StatsBar({ stats = DEFAULT_STATS, className }: StatsBarProps) {
    return (
        <div
            className={cn(
                'border-y border-border/60 bg-card/40 backdrop-blur-sm',
                className,
            )}
        >
            <div className="container mx-auto grid grid-cols-2 divide-x divide-y divide-border/60 px-4 py-8 md:grid-cols-4 md:divide-y-0 md:py-10">
                {stats.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1 px-4 py-2 text-center">
                        <div className="font-heading text-3xl font-bold leading-none tracking-[-0.04em] md:text-4xl">
                            {s.num}
                            {s.suffix && <span className="text-primary">{s.suffix}</span>}
                        </div>
                        <div className="font-mono text-[0.7rem] uppercase tracking-[0.05em] text-muted-foreground md:text-xs">
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
