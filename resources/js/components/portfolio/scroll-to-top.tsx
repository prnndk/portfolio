'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ScrollToTopProps {
    threshold?: number;
    className?: string;
}

export function ScrollToTop({ threshold = 400, className }: ScrollToTopProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > threshold);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    type="button"
                    aria-label="Scroll to top"
                    onClick={scrollToTop}
                    initial={{ opacity: 0, y: 20, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.85 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                        'fixed right-6 bottom-6 z-40 flex h-11 w-11 items-center justify-center',
                        'rounded-full border border-border/60 bg-background/80 text-muted-foreground shadow-lg shadow-black/10 backdrop-blur-md backdrop-saturate-150',
                        'transition-colors hover:border-primary/60 hover:text-primary hover:shadow-[0_8px_24px_color-mix(in_oklch,var(--primary)_30%,transparent)]',
                        'sm:right-8 sm:bottom-8',
                        className,
                    )}
                >
                    <ArrowUp className="h-4 w-4" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
