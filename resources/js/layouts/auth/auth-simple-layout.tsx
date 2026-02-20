'use client';

import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { initializeTheme } from '@/hooks/use-appearance';
import { Toaster } from '@/components/ui/sonner';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const initializedRef = useRef(false);

    // Initialize theme once on first render
    useEffect(() => {
        if (!initializedRef.current) {
            initializeTheme();
            initializedRef.current = true;
        }
    }, []);

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
            {/* Subtle gradient orbs */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            {/* Theme Toggle */}
            <div className="fixed top-6 right-6 z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/80 backdrop-blur-sm shadow-sm"
                >
                    <AnimatedThemeToggler />
                </motion.div>
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative z-10 w-full max-w-[400px] px-6"
            >
                {/* Header */}
                <div className="mb-8 flex flex-col items-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center text-2xl font-semibold tracking-tight text-foreground"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mt-2 text-center text-sm text-muted-foreground"
                    >
                        {description}
                    </motion.p>
                </div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-border/50 bg-card/95 p-6 shadow-xl shadow-black/[0.03] backdrop-blur-sm dark:bg-card/80 dark:shadow-black/20"
                >
                    {children}
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center"
                >
                    <Link
                        href={route('home')}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to home
                    </Link>
                </motion.div>
            </motion.div>

            {/* Bottom Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-6 text-center text-xs text-muted-foreground/50"
            >
                © {new Date().getFullYear()} Gading's Portfolio
            </motion.footer>

            <Toaster />
        </div>
    );
}
