'use client';

import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { type ReactNode, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { useAppearance, initializeTheme } from '@/hooks/use-appearance';

interface GuestLayoutProps {
    children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();
    const { appearance } = useAppearance();
    const initializedRef = useRef(false);

    // Initialize theme once on first render (not on every navigation)
    useEffect(() => {
        if (!initializedRef.current) {
            initializeTheme();
            initializedRef.current = true;
        }
    }, []);

    // Track scroll position without causing layout shifts
    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    // Check initial scroll position on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsScrolled(window.scrollY > 50);
        }
    }, []);

    // Determine if dark mode - safe for SSR
    const isDark = typeof window !== 'undefined' && (
        appearance === 'dark' ||
        (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: 'Activities', href: '/activities' },
        { label: 'Favorites', href: '/favorites' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' },
    ];

    // Helper to determine if link is internal (not a hash link)
    const isInternalLink = (href: string) => href.startsWith('/') && !href.includes('#');

    // Calculate background color based on scroll and theme
    const getNavBackground = () => {
        if (!isScrolled) {
            return 'transparent';
        }
        return isDark ? 'rgba(10, 22, 40, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <header
                className={cn(
                    "fixed top-0 z-50 w-full backdrop-blur-md transition-colors duration-300",
                )}
                style={{
                    backgroundColor: getNavBackground(),
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
                        {/* Always render the theme toggler container to prevent layout shift */}
                        <div className="ml-2 w-9 h-9 flex items-center justify-center">
                            <AnimatedThemeToggler />
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        {/* Always render the theme toggler container to prevent layout shift */}
                        <div className="w-9 h-9 flex items-center justify-center">
                            <AnimatedThemeToggler />
                        </div>
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
            </header>

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
