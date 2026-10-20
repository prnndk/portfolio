'use client';

import { cn } from '@/lib/utils';

type DotColor = 'primary' | 'accent2' | 'emerald';

interface FloatingBadgeProps {
    label: string;
    dotColor?: DotColor;
    className?: string;
    delay?: string;
}

const dotClass: Record<DotColor, string> = {
    primary: 'bg-primary',
    accent2: 'bg-[color:var(--accent2)]',
    emerald: 'bg-emerald-500 dark:bg-emerald-400',
};

export function FloatingBadge({ label, dotColor = 'primary', className, delay = '0s' }: FloatingBadgeProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-xl border border-border bg-card/90 px-3.5 py-2 font-mono text-xs text-muted-foreground shadow-lg shadow-black/30 backdrop-blur-sm [animation:var(--animate-float)]',
                className,
            )}
            style={{ animationDelay: delay }}
        >
            <span className={cn('size-1.5 rounded-full', dotClass[dotColor])} />
            {label}
        </div>
    );
}
