'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
    className?: string;
}

// Extract headings from markdown content
function extractHeadings(markdown: string): TocItem[] {
    const headingRegex = /^(#{1,4})\s+(.+)$/gm;
    const headings: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        headings.push({ id, text, level });
    }

    return headings;
}

// Build a tree structure from flat headings
interface TocTreeItem extends TocItem {
    children: TocTreeItem[];
    index: number;
}

function buildTree(headings: TocItem[]): TocTreeItem[] {
    const result: TocTreeItem[] = [];
    const stack: TocTreeItem[] = [];

    headings.forEach((heading, index) => {
        const item: TocTreeItem = { ...heading, children: [], index };

        while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
            stack.pop();
        }

        if (stack.length === 0) {
            result.push(item);
        } else {
            stack[stack.length - 1].children.push(item);
        }

        stack.push(item);
    });

    return result;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeId, setActiveId] = useState<string>('');
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const headings = useMemo(() => extractHeadings(content), [content]);
    const tree = useMemo(() => buildTree(headings), [headings]);

    // Track active heading based on scroll position
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-100px 0px -80% 0px',
                threshold: 0,
            }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings]);

    const scrollToHeading = useCallback((id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    }, []);

    const toggleCollapse = useCallback((id: string) => {
        setCollapsed(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Render a tree item and its children recursively
    const renderItem = useCallback((item: TocTreeItem, depth: number = 0) => {
        const hasChildren = item.children.length > 0;
        const isCollapsed = collapsed.has(item.id);
        const isActive = activeId === item.id;
        const indent = depth * 16;

        return (
            <div key={`${item.id}-${item.index}`}>
                <div
                    className="relative"
                    style={{ paddingLeft: `${indent}px` }}
                >
                    {/* Tree connector lines */}
                    {depth > 0 && (
                        <>
                            <div
                                className="absolute top-0 bottom-0 border-l border-border/50"
                                style={{ left: `${indent - 12}px` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-2 border-t border-border/50"
                                style={{ left: `${indent - 12}px` }}
                            />
                        </>
                    )}

                    <div className="flex items-center">
                        {/* Collapse toggle for items with children */}
                        {hasChildren && (
                            <button
                                onClick={() => toggleCollapse(item.id)}
                                className="flex-shrink-0 p-1 -ml-1 mr-1 rounded hover:bg-muted/80 transition-colors"
                                title={isCollapsed ? 'Expand' : 'Collapse'}
                            >
                                {isCollapsed ? (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                scrollToHeading(item.id);
                                if (window.innerWidth < 1280) {
                                    setIsOpen(false);
                                }
                            }}
                            className={cn(
                                "flex-1 text-left py-1.5 px-2 rounded-md text-sm transition-all",
                                "hover:bg-muted/80 hover:text-foreground",
                                "flex items-center gap-2",
                                !hasChildren && "ml-5",
                                // Level-specific styling
                                item.level === 1 && "font-bold text-base",
                                item.level === 2 && "font-semibold",
                                item.level === 3 && "font-medium text-muted-foreground",
                                item.level === 4 && "text-xs text-muted-foreground/80",
                                // Active state
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground/80"
                            )}
                        >
                            {/* Level indicator dot */}
                            <span className={cn(
                                "flex-shrink-0 rounded-full",
                                item.level === 1 && "w-2.5 h-2.5 bg-primary",
                                item.level === 2 && "w-2 h-2 bg-primary/60",
                                item.level === 3 && "w-1.5 h-1.5 bg-muted-foreground/50",
                                item.level === 4 && "w-1 h-1 bg-muted-foreground/30",
                                isActive && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                            )} />
                            <span className="line-clamp-2">{item.text}</span>
                        </button>
                    </div>
                </div>

                {/* Children */}
                <AnimatePresence initial={false}>
                    {hasChildren && !isCollapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            {item.children.map(child => renderItem(child, depth + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }, [activeId, collapsed, scrollToHeading, toggleCollapse, setIsOpen]);

    if (headings.length === 0) {
        return null;
    }

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed right-4 top-1/2 -translate-y-1/2 z-40",
                    "hidden xl:flex items-center justify-center",
                    "h-10 w-10 rounded-full",
                    "bg-background border border-border shadow-lg",
                    "text-muted-foreground hover:text-foreground hover:border-primary/50",
                    "transition-all duration-200",
                    isOpen && "opacity-0 pointer-events-none"
                )}
                title="Show table of contents"
            >
                <List className="h-5 w-5" />
            </button>

            {/* TOC Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 xl:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={cn(
                                "fixed right-0 top-0 h-full z-50",
                                "w-80 max-w-[calc(100vw-2rem)]",
                                "bg-background border-l border-border shadow-2xl",
                                "flex flex-col",
                                className
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                    Table of Contents
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    title="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <nav className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-1">
                                    {tree.map(item => renderItem(item, 0))}
                                </div>
                            </nav>

                            {/* Footer */}
                            <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
                                {headings.length} section{headings.length !== 1 ? 's' : ''}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
