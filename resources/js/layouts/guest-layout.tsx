'use client';

import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { useAppearance, initializeTheme } from '@/hooks/use-appearance';

interface GuestLayoutProps {
    children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { scrollY } = useScroll();
    const { appearance } = useAppearance();

    // Determine if dark mode
    const isDark = appearance === 'dark' ||
        (appearance === 'system' && typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    const navBackground = useTransform(
        scrollY,
        [0, 100],
        ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.9)']
    );

    const navBackgroundDark = useTransform(
        scrollY,
        [0, 100],
        ['rgba(10, 22, 40, 0)', 'rgba(10, 22, 40, 0.9)']
    );

    // Initialize theme on mount to prevent flicker
    useEffect(() => {
        initializeTheme();
        setMounted(true);
    }, []);

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: 'Activities', href: '/activities' },
        { label: 'Favorites', href: '/favorites' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '#contact' },
    ];

    // Helper to determine if link is internal (not a hash link)
    const isInternalLink = (href: string) => href.startsWith('/') && !href.includes('#');

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <motion.header
                className="fixed top-0 z-50 w-full backdrop-blur-md"
                style={{
                    backgroundColor: mounted && isDark ? navBackgroundDark : navBackground,
                }}
            >
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="font-heading text-xl font-bold text-primary">
                        Gading's Portfolio
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-6 md:flex">
                        {navItems.map((item) =>
                            isInternalLink(item.href) ? (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {item.label}
                                </a>
                            )
                        )}
                        {mounted && <AnimatedThemeToggler className="ml-2" />}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        {mounted && <AnimatedThemeToggler />}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <motion.nav
                    initial={false}
                    animate={{ height: isMenuOpen ? 'auto' : 0 }}
                    className="overflow-hidden md:hidden"
                >
                    <div className="container mx-auto space-y-2 px-4 pb-4">
                        {navItems.map((item) =>
                            isInternalLink(item.href) ? (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            )
                        )}
                    </div>
                </motion.nav>
            </motion.header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t border-border bg-card py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Developed by Prnndk.
                    </p>
                </div>
            </footer>
            <Toaster />
        </div>
    );
}
