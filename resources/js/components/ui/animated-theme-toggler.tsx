'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAppearance } from '@/hooks/use-appearance';

interface AnimatedThemeTogglerProps {
    className?: string;
    duration?: number;
}

export function AnimatedThemeToggler({
    className,
    duration = 400,
}: AnimatedThemeTogglerProps) {
    const { appearance, updateAppearance } = useAppearance();

    // Determine if currently dark (accounting for system preference)
    const isDark = appearance === 'dark' ||
        (appearance === 'system' && typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    const springConfig = {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
        duration: duration / 1000,
    };

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent',
                className
            )}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="relative h-5 w-5">
                {/* Sun */}
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute inset-0 h-5 w-5"
                    initial={false}
                    animate={{
                        scale: isDark ? 0 : 1,
                        opacity: isDark ? 0 : 1,
                        rotate: isDark ? -90 : 0,
                    }}
                    transition={springConfig}
                >
                    <circle cx="12" cy="12" r="4" />
                    <motion.g
                        initial={false}
                        animate={{ rotate: isDark ? -45 : 0 }}
                        transition={springConfig}
                    >
                        <line x1="12" y1="2" x2="12" y2="4" />
                        <line x1="12" y1="20" x2="12" y2="22" />
                        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                        <line x1="2" y1="12" x2="4" y2="12" />
                        <line x1="20" y1="12" x2="22" y2="12" />
                        <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                        <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
                    </motion.g>
                </motion.svg>

                {/* Moon */}
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute inset-0 h-5 w-5"
                    initial={false}
                    animate={{
                        scale: isDark ? 1 : 0,
                        opacity: isDark ? 1 : 0,
                        rotate: isDark ? 0 : 90,
                    }}
                    transition={springConfig}
                >
                    <motion.path
                        d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
                        initial={false}
                        animate={{
                            pathLength: isDark ? 1 : 0,
                        }}
                        transition={{ ...springConfig, delay: isDark ? 0.1 : 0 }}
                    />
                    {/* Stars */}
                    <motion.circle
                        cx="19"
                        cy="5"
                        r="0.5"
                        fill="currentColor"
                        initial={false}
                        animate={{
                            scale: isDark ? 1 : 0,
                            opacity: isDark ? 1 : 0,
                        }}
                        transition={{ ...springConfig, delay: isDark ? 0.2 : 0 }}
                    />
                    <motion.circle
                        cx="21"
                        cy="8"
                        r="0.3"
                        fill="currentColor"
                        initial={false}
                        animate={{
                            scale: isDark ? 1 : 0,
                            opacity: isDark ? 1 : 0,
                        }}
                        transition={{ ...springConfig, delay: isDark ? 0.25 : 0 }}
                    />
                    <motion.circle
                        cx="17"
                        cy="3"
                        r="0.4"
                        fill="currentColor"
                        initial={false}
                        animate={{
                            scale: isDark ? 1 : 0,
                            opacity: isDark ? 1 : 0,
                        }}
                        transition={{ ...springConfig, delay: isDark ? 0.3 : 0 }}
                    />
                </motion.svg>
            </div>
        </button>
    );
}
