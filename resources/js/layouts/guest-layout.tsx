'use client';

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Toaster } from '@/components/ui/sonner';
import { initializeTheme, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ChevronDown, FileText, Image, Menu, Search, Wrench, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

interface GuestLayoutProps {
    children: ReactNode;
}

// Tool items for bento grid
const toolItems = [
    {
        title: 'Image Compressor',
        href: '/tools/image-compress',
        description: 'Compress images locally without uploading. Crop, rotate, and convert formats.',
        icon: Image,
        featured: true,
    },
    {
        title: 'JPG to PDF',
        href: '/tools/jpg-to-pdf',
        description: 'Convert images into a PDF document with custom page size and orientation.',
        icon: FileText,
        featured: true,
    },
    {
        title: 'PDF Merge',
        href: '/tools/pdf-merge',
        description: 'Combine multiple PDF files into a single document.',
        icon: FileText,
        featured: false,
    },
    {
        title: 'PDF Split',
        href: '/tools/pdf-split',
        description: 'Extract specific pages or split a PDF into separate files.',
        icon: FileText,
        featured: false,
    },
    {
        title: 'PDF to Images',
        href: '/tools/pdf-to-images',
        description: 'Convert PDF pages to high-quality JPG or PNG images.',
        icon: FileText,
        featured: false,
    },
    {
        title: 'PDF Compress',
        href: '/tools/pdf-compress',
        description: 'Reduce PDF file size by optimizing the document.',
        icon: FileText,
        featured: false,
    },
    {
        title: 'PDF Rotate',
        href: '/tools/pdf-rotate',
        description: 'Rotate individual or all pages of a PDF document.',
        icon: FileText,
        featured: false,
    },
];

// List item component for navigation menu
const ListItem = ({
    className,
    title,
    description,
    href,
    icon: Icon,
    featured,
}: {
    className?: string;
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    featured?: boolean;
}) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    href={href}
                    className={cn(
                        'group block rounded-lg p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                        featured && 'bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20',
                        className,
                    )}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                                featured
                                    ? 'bg-primary/10 text-primary group-hover:bg-primary/20'
                                    : 'bg-muted text-muted-foreground group-hover:bg-accent',
                            )}
                        >
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="text-sm leading-none font-medium">{title}</div>
                                {featured && (
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                        New
                                    </span>
                                )}
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{description}</p>
                        </div>
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
    );
};

export default function GuestLayout({ children }: GuestLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { scrollY } = useScroll();
    const { appearance } = useAppearance();
    const initializedRef = useRef(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Initialize theme once on first render (not on every navigation)
    useEffect(() => {
        if (!initializedRef.current) {
            initializeTheme();
            initializedRef.current = true;
        }
    }, []);

    // Track scroll position without causing layout shifts
    useMotionValueEvent(scrollY, 'change', (latest) => {
        setIsScrolled(latest > 50);
    });

    // Check initial scroll position on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsScrolled(window.scrollY > 50);
        }
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isSearchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [isSearchOpen]);

    // Close search overlay on Escape, open on Ctrl+K or /
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen((v) => !v);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const submitSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const q = searchQuery.trim();
        setIsSearchOpen(false);
        setSearchQuery('');
        if (q) {
            router.get('/search', { q });
        }
    };

    // Determine if dark mode - safe for SSR
    const isDark =
        typeof window !== 'undefined' &&
        (appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
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
                className={cn('fixed top-0 z-50 w-full backdrop-blur-md transition-colors duration-300')}
                style={{
                    backgroundColor: getNavBackground(),
                }}
            >
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="font-heading text-xl font-bold text-primary">
                        Gading's Portfolio
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden items-center gap-1 md:flex">
                        <NavigationMenu>
                            <NavigationMenuList>
                                {navItems.map((item) => (
                                    <NavigationMenuItem key={item.label}>
                                        <NavigationMenuLink asChild>
                                            <Link href={item.href} className={cn(navigationMenuTriggerStyle(), 'bg-transparent')}>
                                                {item.label}
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ))}

                                {/* More Dropdown with Bento Grid */}
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="bg-transparent">More</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="w-[400px] p-4 md:w-[500px]">
                                            {/* Header */}
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                        <Wrench className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold">Tools</h4>
                                                        <p className="text-xs text-muted-foreground">Free utilities</p>
                                                    </div>
                                                </div>
                                                <Link href="/tools" className="text-xs font-medium text-primary hover:underline">
                                                    View all →
                                                </Link>
                                            </div>

                                            {/* Bento Grid */}
                                            <ul className="grid gap-2">
                                                {toolItems.map((tool) => (
                                                    <ListItem
                                                        key={tool.title}
                                                        title={tool.title}
                                                        description={tool.description}
                                                        href={tool.href}
                                                        icon={tool.icon}
                                                        featured={tool.featured}
                                                    />
                                                ))}
                                            </ul>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>

                        <div className="ml-2 flex h-9 w-9 items-center justify-center">
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsSearchOpen(true)} title="Search (Ctrl+K)">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center">
                            <AnimatedThemeToggler />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                            <Search className="h-5 w-5" />
                        </Button>
                        <div className="flex h-9 w-9 items-center justify-center">
                            <AnimatedThemeToggler />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <motion.nav initial={false} animate={{ height: isMenuOpen ? 'auto' : 0 }} className="overflow-hidden md:hidden">
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
                            ),
                        )}

                        {/* Mobile More Section */}
                        <div className="border-t border-border pt-2">
                            <button
                                onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
                                className="flex w-full items-center justify-between py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                More
                                <ChevronDown className={cn('h-4 w-4 transition-transform', isMobileMoreOpen && 'rotate-180')} />
                            </button>
                            <motion.div initial={false} animate={{ height: isMobileMoreOpen ? 'auto' : 0 }} className="overflow-hidden">
                                <div className="space-y-2 py-2 pl-4">
                                    <p className="text-xs tracking-wider text-muted-foreground/70 uppercase">Tools</p>
                                    <Link
                                        href="/tools"
                                        className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-primary"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Wrench className="h-4 w-4" />
                                        All Tools
                                    </Link>
                                    {toolItems.map((tool) => (
                                        <Link
                                            key={tool.href}
                                            href={tool.href}
                                            className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-primary"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <tool.icon className="h-4 w-4" />
                                            {tool.title}
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.nav>
            </header>

            <main>{children}</main>

            {/* Full-screen search overlay */}
            {isSearchOpen && (
                <div
                    className="fixed inset-0 z-60 flex items-start justify-center bg-background/80 pt-24 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsSearchOpen(false);
                    }}
                >
                    <div className="w-full max-w-2xl px-4">
                        <form onSubmit={submitSearch} className="relative">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search posts, projects, activities..."
                                className="h-14 rounded-xl border-border bg-background pr-4 pl-12 text-base shadow-lg"
                            />
                        </form>
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                            Press <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">Enter</kbd> to search ·{' '}
                            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">Esc</kbd> to close
                        </p>
                    </div>
                </div>
            )}

            <footer className="border-t border-border bg-card py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Developed by Prnndk.</p>
                </div>
            </footer>
            <Toaster />
        </div>
    );
}
