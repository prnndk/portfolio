'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TypedCycleProps {
    words: string[];
    className?: string;
    typeSpeed?: number;
    pauseMs?: number;
    cursorClassName?: string;
}

export function TypedCycle({
    words,
    className,
    typeSpeed = 80,
    pauseMs = 2000,
    cursorClassName,
}: TypedCycleProps) {
    const [display, setDisplay] = useState('');
    const [wordIdx, setWordIdx] = useState(0);
    const [phase, setPhase] = useState<'typing' | 'deleting'>('typing');

    useEffect(() => {
        if (words.length === 0) return;
        const current = words[wordIdx];
        let timeout: ReturnType<typeof setTimeout>;

        if (phase === 'typing') {
            if (display.length < current.length) {
                timeout = setTimeout(
                    () => setDisplay(current.slice(0, display.length + 1)),
                    typeSpeed,
                );
            } else {
                timeout = setTimeout(() => setPhase('deleting'), pauseMs);
            }
        } else {
            if (display.length > 0) {
                timeout = setTimeout(
                    () => setDisplay(display.slice(0, -1)),
                    typeSpeed / 2,
                );
            } else {
                setWordIdx((i) => (i + 1) % words.length);
                setPhase('typing');
                return;
            }
        }
        return () => clearTimeout(timeout);
    }, [display, phase, wordIdx, words, typeSpeed, pauseMs]);

    return (
        <span className={cn('inline-flex items-baseline', className)}>
            <span className="min-w-0">{display}</span>
            <span
                className={cn(
                    'ml-1 inline-block h-[1em] w-[2px] translate-y-[2px] bg-current [animation:var(--animate-blink)]',
                    cursorClassName,
                )}
            />
        </span>
    );
}
