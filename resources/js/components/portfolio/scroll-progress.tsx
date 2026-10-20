'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollProgressProps {
    target?: React.RefObject<HTMLElement | null>;
    className?: string;
}

export function ScrollProgress({ target, className }: ScrollProgressProps) {
    const { scrollYProgress } = useScroll(target ? { target, offset: ['start start', 'end end'] } : undefined);
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.2 });

    return (
        <motion.div
            aria-hidden
            style={{ scaleX, transformOrigin: '0% 50%' }}
            className={
                'fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-[color:var(--accent2)] to-primary shadow-[0_0_12px_color-mix(in_oklch,var(--primary)_60%,transparent)] ' +
                (className ?? '')
            }
        />
    );
}
